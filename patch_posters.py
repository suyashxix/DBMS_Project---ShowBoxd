"""
patch_missing_posters.py

Retries only the rows that still have no poster_url,
falling back to the opposite media type if the first search fails.

Run from your Django project root:
    python patch_missing_posters.py
"""

import psycopg2
import requests
import time

TMDB_API_KEY    = "a98a80acd0f56d6be46fcc181da70820"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

DB_CONFIG = {
    "dbname":   "showboxd",
    "user":     "postgres",
    "password": "skt251271",
    "host":     "localhost",
    "port":     5432,
}


def search_tmdb(title, tmdb_type):
    url    = f"https://api.themoviedb.org/3/search/{tmdb_type}"
    params = {"api_key": TMDB_API_KEY, "query": title, "page": 1}
    try:
        res     = requests.get(url, params=params, timeout=5)
        results = res.json().get("results", [])
        if results and results[0].get("poster_path"):
            return TMDB_IMAGE_BASE + results[0]["poster_path"]
    except Exception as e:
        print(f"  Error: {e}")
    return None


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()

    cur.execute("""
        SELECT media_id, title, media_type
        FROM media
        WHERE poster_url IS NULL OR poster_url = ''
        ORDER BY media_id
    """)
    rows = cur.fetchall()
    print(f"Retrying {len(rows)} rows without posters...\n")

    updated = 0

    for media_id, title, media_type in rows:
        # Try the correct type first
        primary  = "movie" if media_type == "movie" else "tv"
        fallback = "tv"    if primary == "movie"    else "movie"

        poster_url = search_tmdb(title, primary)

        # If not found, try the other type (many entries are misclassified)
        if not poster_url:
            poster_url = search_tmdb(title, fallback)
            if poster_url:
                print(f"  ~ [{media_id}] {title} — found via {fallback} fallback")

        if poster_url:
            cur.execute(
                "UPDATE media SET poster_url = %s WHERE media_id = %s",
                (poster_url, media_id)
            )
            print(f"  ✓ [{media_id}] {title} → {poster_url}")
            updated += 1
        else:
            print(f"  ✗ [{media_id}] {title} — not found on either endpoint")

        time.sleep(0.26)

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nDone. Updated {updated}/{len(rows)} remaining rows.")


if __name__ == "__main__":
    main()