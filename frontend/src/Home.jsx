import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

  .hm-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .hm-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 32px 28px 48px;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Top bar */
  .hm-topbar {
    display: flex;
    gap: 12px;
    align-items: stretch;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .hm-search-wrap {
    flex: 1;
    min-width: 220px;
    position: relative;
  }
  .hm-search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    pointer-events: none;
    color: #aaa;
  }
  .hm-search {
    width: 100%;
    padding: 10px 14px 10px 38px;
    border: 1px solid #e0ddd6;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    background: #fff;
    color: #111;
    outline: none;
    transition: border-color 0.15s;
    height: 42px;
  }
  .hm-search:focus { border-color: #111; }

  /* Filter pills */
  .hm-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    align-items: center;
  }
  .hm-filter-label { font-size: 12px; color: #999; margin-right: 2px; }
  .hm-pill {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #e0ddd6;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: #555;
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
  }
  .hm-pill:hover { border-color: #aaa; color: #111; }
  .hm-pill.active { background: #111; color: #fff; border-color: #111; }

  .hm-select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #e0ddd6;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    outline: none;
    height: 34px;
  }
  .hm-select:focus { border-color: #111; }

  /* Results header */
  .hm-results-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .hm-results-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px;
    font-weight: 400;
    color: #111;
  }
  .hm-results-count { font-size: 13px; color: #999; }

  /* Grid */
  .hm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
  }

  /* Card */
  .hm-card {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .hm-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

  .hm-card-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background: #1a1a1a;
    display: block;
  }
  .hm-card-poster-placeholder {
    width: 100%;
    aspect-ratio: 2/3;
    background: linear-gradient(145deg, #1a1a1a, #2e2e2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
  }
  .hm-card-body { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .hm-card-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .hm-card-meta { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
  .hm-card-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    background: #111;
    color: #f5c518;
    padding: 2px 8px;
    border-radius: 12px;
  }
  .hm-card-type {
    font-size: 11px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Empty / loading */
  .hm-empty { text-align: center; padding: 60px 20px; color: #888; font-size: 15px; }
  .hm-loading { text-align: center; padding: 60px; color: #888; }

  /* Active filter summary */
  .hm-active-filter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #111;
    color: #fff;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 12px;
  }
  .hm-active-filter button {
    background: none;
    border: none;
    color: #aaa;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    line-height: 1;
  }
  .hm-active-filter button:hover { color: #fff; }

  @media (max-width: 600px) {
    .hm-wrap { padding: 20px 16px 40px; }
    .hm-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  }
`;

const TYPE_FILTERS = [
  { label: 'All',      value: '' },
  { label: 'Movies',   value: 'movie' },
  { label: 'TV Shows', value: 'tv_show' },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [media,      setMedia]      = useState([]);
  const [genres,     setGenres]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState(searchParams.get('q')         || '');
  const [mediaType,  setMediaType]  = useState(searchParams.get('type')      || '');
  const [genre,      setGenre]      = useState(searchParams.get('genre')     || '');
  const [topRated,   setTopRated]   = useState(searchParams.get('top_rated') === 'true');

  // Load genres once for the dropdown
  useEffect(() => {
    axios.get(`${API}/api/genres/`)
      .then(res => setGenres(res.data))
      .catch(() => {});
  }, []);

  // Re-fetch whenever any filter changes (debounced for search)
  const fetchMedia = useCallback(() => {
    setLoading(true);
    const params = {};
    if (query)     params.q         = query;
    if (mediaType) params.type      = mediaType;
    if (genre)     params.genre     = genre;
    if (topRated)  params.top_rated = 'true';

    const endpoint = (query || genre || topRated) ? '/api/search/' : '/api/catalog/';
    axios.get(`${API}${endpoint}`, { params })
      .then(res => setMedia(Array.isArray(res.data) ? res.data : (res.data.results ?? [])))

      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, [query, mediaType, genre, topRated]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(fetchMedia, query ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchMedia, query]);

  const resultLabel = () => {
    if (topRated)      return 'Top Rated';
    if (query)         return `Results for "${query}"`;
    if (genre)         return genre;
    if (mediaType === 'movie')   return 'Movies';
    if (mediaType === 'tv_show') return 'TV Shows';
    return 'Browse';
  };

  return (
    <>
      <style>{styles}</style>
      <div className="hm-wrap">

        {/* Search bar */}
        <div className="hm-topbar">
          <div className="hm-search-wrap">
            <span className="hm-search-icon">🔍</span>
            <input
              className="hm-search"
              type="text"
              placeholder="Search movies & shows…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <select
            className="hm-select"
            value={genre}
            onChange={e => { setGenre(e.target.value); setTopRated(false); }}
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g.genre_id} value={g.genre_name}>{g.genre_name}</option>
            ))}
          </select>
        </div>

        {/* Type + Top Rated filter pills */}
        <div className="hm-filters">
          <span className="hm-filter-label">Type:</span>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              className={`hm-pill ${mediaType === f.value && !topRated ? 'active' : ''}`}
              onClick={() => { setMediaType(f.value); setTopRated(false); }}
            >
              {f.label}
            </button>
          ))}
          <span className="hm-filter-label" style={{ marginLeft: '8px' }}>Sort:</span>
          <button
            className={`hm-pill ${topRated ? 'active' : ''}`}
            onClick={() => { setTopRated(t => !t); setMediaType(''); }}
          >
            ⭐ Top Rated
          </button>
        </div>

        {/* Results header */}
        <div className="hm-results-header">
          <h2 className="hm-results-title">{resultLabel()}</h2>
          {!loading && <span className="hm-results-count">{media.length} title{media.length !== 1 ? 's' : ''}</span>}
        </div>

        {loading && <div className="hm-loading">Loading…</div>}

        {!loading && media.length === 0 && (
          <div className="hm-empty">No titles found. Try a different search or filter.</div>
        )}

        {!loading && (
          <div className="hm-grid">
            {media.map(item => (
              <Link to={`/media/${item.media_id}`} className="hm-card" key={item.media_id}>
                {item.poster_url
                  ? <img className="hm-card-poster" src={item.poster_url} alt={item.title} onError={e => { e.target.style.display='none'; }} />
                  : <div className="hm-card-poster-placeholder">🎬</div>
                }
                <div className="hm-card-body">
                  <div className="hm-card-title">{item.title}</div>
                  <div className="hm-card-meta">
                    {item.aggregate_rating
                      ? <span className="hm-card-rating">⭐ {item.aggregate_rating}</span>
                      : <span className="hm-card-rating" style={{ background: '#ccc', color: '#666' }}>NR</span>
                    }
                    <span className="hm-card-type">{item.media_type === 'tv_show' ? 'TV' : 'Film'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}