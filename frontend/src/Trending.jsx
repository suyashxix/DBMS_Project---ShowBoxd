import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .tr-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .tr-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 36px 28px 56px;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Page header */
  .tr-header {
    margin-bottom: 32px;
    animation: tr-fade-up 0.4s ease both;
  }
  .tr-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #1a6b3c;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tr-eyebrow::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 2px;
    background: #1a6b3c;
    border-radius: 2px;
  }
  .tr-title {
    font-family: 'DM Serif Display', serif;
    font-size: 38px;
    font-weight: 400;
    color: #111;
    line-height: 1.1;
    margin-bottom: 10px;
  }
  .tr-title em { font-style: italic; color: #1a6b3c; }
  .tr-sub { font-size: 14px; color: #888; }

  @keyframes tr-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Filter tabs */
  .tr-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 28px;
    flex-wrap: wrap;
    animation: tr-fade-up 0.4s 0.05s ease both;
  }
  .tr-tab {
    padding: 7px 16px;
    border-radius: 20px;
    border: 1px solid #e0ddd6;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: #666;
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
  }
  .tr-tab:hover { border-color: #aaa; color: #111; }
  .tr-tab.active { background: #111; color: #fff; border-color: #111; }

  /* Grid */
  .tr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px;
  }

  /* Card */
  .tr-card {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s;
    animation: tr-card-in 0.4s ease both;
  }
  .tr-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }

  @keyframes tr-card-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Rank badge */
  .tr-rank {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  .tr-rank.top3 {
    background: #1a6b3c;
    font-size: 13px;
    font-weight: 600;
  }

  .tr-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background: #1a1a1a;
    display: block;
  }
  .tr-poster-placeholder {
    width: 100%;
    aspect-ratio: 2/3;
    background: linear-gradient(145deg, #1a1a1a, #2e2e2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }

  .tr-card-body {
    padding: 12px 14px 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tr-card-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tr-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }
  .tr-card-rating {
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
  .tr-card-type {
    font-size: 11px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Loading / empty */
  .tr-loading { text-align: center; padding: 80px 20px; color: #888; font-size: 15px; }
  .tr-empty   { text-align: center; padding: 80px 20px; color: #888; font-size: 15px; }

  @media (max-width: 600px) {
    .tr-wrap { padding: 24px 16px 40px; }
    .tr-title { font-size: 28px; }
    .tr-grid  { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  }
`;

const FILTERS = [
  { label: 'All',      value: '' },
  { label: 'Movies',   value: 'movie' },
  { label: 'TV Shows', value: 'tv_show' },
];

export default function Trending() {
  const [items,    setItems]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [filter,   setFilter]  = useState('');

  useEffect(() => {
    axios.get(`${API}/api/trending/`)
      .then(res => setItems(Array.isArray(res.data) ? res.data : (res.data.results ?? [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? items.filter(i => i.media_type === filter)
    : items;

  return (
    <>
      <style>{styles}</style>
      <div className="tr-wrap">

        <div className="tr-header">
          <div className="tr-eyebrow">Right now</div>
          <h1 className="tr-title">What's <em>Trending</em></h1>
          <p className="tr-sub">The most-watched titles on Cinélog this week</p>
        </div>

        <div className="tr-tabs">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`tr-tab ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <div className="tr-loading">Loading trending titles…</div>}

        {!loading && filtered.length === 0 && (
          <div className="tr-empty">No trending titles found right now.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="tr-grid">
            {filtered.map((item, idx) => (
              <Link
                to={`/media/${item.media_id}`}
                className="tr-card"
                key={item.media_id}
                style={{ animationDelay: `${Math.min(idx, 12) * 0.04}s` }}
              >
                <span className={`tr-rank ${idx < 3 ? 'top3' : ''}`}>
                  {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                </span>

                {item.poster_url
                  ? <img className="tr-poster" src={item.poster_url} alt={item.title}
                      onError={e => { e.target.style.display = 'none'; }} />
                  : <div className="tr-poster-placeholder">🎬</div>
                }

                <div className="tr-card-body">
                  <div className="tr-card-title">{item.title}</div>
                  <div className="tr-card-meta">
                    {item.aggregate_rating
                      ? <span className="tr-card-rating">⭐ {item.aggregate_rating}</span>
                      : <span className="tr-card-rating" style={{ background: '#ccc', color: '#666' }}>NR</span>
                    }
                    <span className="tr-card-type">{item.media_type === 'tv_show' ? 'TV' : 'Film'}</span>
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