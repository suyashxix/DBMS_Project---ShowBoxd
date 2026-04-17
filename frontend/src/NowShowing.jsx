import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

  .ns-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .ns-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 40px 28px 60px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .ns-header { margin-bottom: 36px; }

  .ns-title {
    font-family: 'DM Serif Display', serif;
    font-size: 40px;
    color: #111;
    margin-bottom: 8px;
  }

  .ns-sub { font-size: 14px; color: #777; }

  .ns-divider {
    width: 120px;
    height: 3px;
    background: linear-gradient(to right, #1a6b3c, rgba(26,107,60,0.4));
    margin-top: 16px;
    border-radius: 3px;
  }

  .ns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px;
  }

  .ns-card {
    text-decoration: none;
    color: inherit;
    opacity: 0;
    transform: translateY(20px);
    animation: ns-fadeUp 0.5s ease forwards;
  }

  @keyframes ns-fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }

  .ns-inner {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .ns-inner:hover {
    box-shadow: 0 14px 34px rgba(0,0,0,0.12);
  }

  .ns-poster-wrap { position: relative; }

  .ns-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    display: block;
    background: #1a1a1a;
  }

  .ns-poster-placeholder {
    width: 100%;
    aspect-ratio: 2/3;
    background: linear-gradient(145deg, #1a1a1a, #2e2e2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }

  .ns-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
    opacity: 0;
    transition: 0.25s;
  }

  .ns-inner:hover .ns-overlay { opacity: 1; }

  .ns-card-body { padding: 12px 14px 14px; }

  .ns-card-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.12s;
  }

  .ns-inner:hover .ns-card-title { color: #1a6b3c; }

  .ns-card-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    background: #111;
    color: #f5c518;
    padding: 2px 7px;
    border-radius: 10px;
    margin-top: 6px;
  }

  .ns-empty {
    text-align: center;
    padding: 60px;
    color: #888;
    font-size: 15px;
  }

  @media (max-width: 600px) {
    .ns-wrap { padding: 24px 16px 40px; }
    .ns-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .ns-title { font-size: 28px; }
  }
`;

export default function NowShowing() {
    const [media,   setMedia]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Single query — backend returns only movies with active showings
        axios.get(`${API}/api/nowshowing/`)
            .then(res => setMedia(Array.isArray(res.data) ? res.data : (res.data.results ?? [])))
            .catch(err => { console.error(err); setMedia([]); })
            .finally(() => setLoading(false));
    }, []);

    const handleMove = (e) => {
        const el   = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const rotateX = (((e.clientY - rect.top)  / rect.height) - 0.5) * -14;
        const rotateY = (((e.clientX - rect.left) / rect.width)  - 0.5) *  14;
        el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    };

    const handleLeave = (e) => {
        e.currentTarget.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    };

    return (
        <>
            <style>{styles}</style>
            <div className="ns-wrap">
                <div className="ns-header">
                    <h1 className="ns-title">Now Showing</h1>
                    <p className="ns-sub">Movies currently in theatres with available seats</p>
                    <div className="ns-divider" />
                </div>

                {loading && <div className="ns-empty">Loading movies…</div>}

                {!loading && media.length === 0 && (
                    <div className="ns-empty">No movies currently showing. Check back soon.</div>
                )}

                {!loading && media.length > 0 && (
                    <div className="ns-grid">
                        {media.map((item, index) => (
                            <Link
                                key={item.media_id}
                                to={`/media/${item.media_id}`}
                                className="ns-card"
                                style={{ animationDelay: `${index * 0.07}s` }}
                            >
                                <div
                                    className="ns-inner"
                                    onMouseMove={handleMove}
                                    onMouseLeave={handleLeave}
                                >
                                    <div className="ns-poster-wrap">
                                        {item.poster_url
                                            ? <img
                                                src={item.poster_url}
                                                className="ns-poster"
                                                alt={item.title}
                                                onError={e => { e.target.style.display = 'none'; }}
                                              />
                                            : <div className="ns-poster-placeholder">🎬</div>
                                        }
                                        <div className="ns-overlay" />
                                    </div>
                                    <div className="ns-card-body">
                                        <div className="ns-card-title">{item.title}</div>
                                        {item.aggregate_rating && (
                                            <span className="ns-card-rating">
                                                ⭐ {item.aggregate_rating}
                                            </span>
                                        )}
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