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

  .tr-header { margin-bottom: 32px; animation: tr-fade-up 0.4s ease both; }
  .tr-eyebrow {
    font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: #1a6b3c;
    margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
  }
  .tr-eyebrow::before {
    content: ''; width: 20px; height: 2px; background: #1a6b3c;
    border-radius: 2px;
  }
  .tr-title {
    font-family: 'DM Serif Display', serif;
    font-size: 38px; color: #111; margin-bottom: 10px;
  }
  .tr-title em { color: #1a6b3c; }
  .tr-sub { font-size: 14px; color: #888; }

  @keyframes tr-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .tr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px;
  }

  .tr-card {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .tr-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }

  .tr-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background: #1a1a1a;
  }

  .tr-card-body {
    padding: 12px;
  }
  .tr-card-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    margin-bottom: 6px;
  }
  .tr-card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tr-card-rating {
    font-size: 12px;
    background: #111;
    color: #f5c518;
    padding: 2px 8px;
    border-radius: 12px;
  }
  .tr-card-type {
    font-size: 11px;
    color: #aaa;
    text-transform: uppercase;
  }

  .tr-loading, .tr-empty {
    text-align: center;
    padding: 80px 20px;
    color: #888;
  }
`;

export default function CurrentlyAiring() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/api/search/`, {
            params: { type: 'tv_show' }
        })
            .then(res => {
                const data = Array.isArray(res.data)
                    ? res.data
                    : (res.data.results ?? []);
                const filtered = data.filter(i => {
                    if (!i.release_date) return true;
                    const diffDays =
                        (new Date() - new Date(i.release_date)) / (1000 * 60 * 60 * 24);
                    return diffDays <= 30;
                });

                setItems(filtered);
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{styles}</style>
            <div className="tr-wrap">

                <div className="tr-header">
                    <div className="tr-eyebrow">On air</div>
                    <h1 className="tr-title">Currently <em>Airing</em></h1>
                    <p className="tr-sub">TV shows you can watch right now</p>
                </div>

                {loading && <div className="tr-loading">Loading shows…</div>}

                {!loading && items.length === 0 && (
                    <div className="tr-empty">No shows found.</div>
                )}

                {!loading && items.length > 0 && (
                    <div className="tr-grid">
                        {items.map((item) => (
                            <Link
                                to={`/media/${item.media_id}`}
                                className="tr-card"
                                key={item.media_id}
                            >
                                {item.poster_url
                                    ? <img src={item.poster_url} className="tr-poster" alt={item.title} />
                                    : <div className="tr-poster">🎬</div>
                                }

                                <div className="tr-card-body">
                                    <div className="tr-card-title">{item.title}</div>
                                    <div className="tr-card-meta">
                                        {item.aggregate_rating
                                            ? <span className="tr-card-rating">⭐ {item.aggregate_rating}</span>
                                            : <span className="tr-card-rating" style={{background:'#ccc',color:'#666'}}>NR</span>
                                        }
                                        <span className="tr-card-type">TV</span>
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