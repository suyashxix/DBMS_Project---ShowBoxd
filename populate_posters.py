
"""
populate_posters.py

Run from your Django project root:
    python populate_posters.py

Requires: pip install requests psycopg2-binary
"""

import psycopg2
import requests
import time

# ── Config ────────────────────────────────────────────────────────────────────
TMDB_API_KEY = "a98a80acd0f56d6be46fcc181da70820"   # <-- replace this
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

DB_CONFIG = {
    "dbname":   "showboxd",
    "user":     "postgres",       # change if different
    "password": "1234",  # change if different
    "host":     "localhost",
    "port":     5432,
}
# ─────────────────────────────────────────────────────────────────────────────

def search_tmdb(title, media_type):
    """Query 15-style search on TMDB — returns best poster path or None."""
    tmdb_type = "movie" if media_type == "movie" else "tv"
    url = f"https://api.themoviedb.org/3/search/{tmdb_type}"
    params = {"api_key": TMDB_API_KEY, "query": title, "page": 1}
    try:
        res = requests.get(url, params=params, timeout=5)
        data = res.json()
        results = data.get("results", [])
        if results and results[0].get("poster_path"):
            return TMDB_IMAGE_BASE + results[0]["poster_path"]
    except Exception as e:
        print(f"  TMDB error for '{title}': {e}")
    return None


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()

    # Fetch all media that don't have a poster yet
    cur.execute("""
        SELECT media_id, title, media_type
        FROM media
        WHERE poster_url IS NULL OR poster_url = ''
        ORDER BY media_id
    """)
    rows = cur.fetchall()
    print(f"Found {len(rows)} media rows without posters.\n")

    updated = 0
    skipped = 0

    for media_id, title, media_type in rows:
        # Clean up duplicate-language entries: strip anything after a "(" if present
        clean_title = title.split("(")[0].strip()
        poster_url  = search_tmdb(clean_title, media_type)

        if poster_url:
            cur.execute(
                "UPDATE media SET poster_url = %s WHERE media_id = %s",
                (poster_url, media_id)
            )
            print(f"  ✓  [{media_id}] {title} → {poster_url}")
            updated += 1
        else:
            print(f"  ✗  [{media_id}] {title} — not found on TMDB")
            skipped += 1

        # Be polite to the API — 4 requests/second max on free tier
        time.sleep(0.7)

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone. Updated: {updated}, Skipped: {skipped}")


if __name__ == "__main__":
    main()