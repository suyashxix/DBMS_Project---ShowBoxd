import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

  .cp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .cp-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 40px 28px 60px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .cp-header { margin-bottom: 36px; }

  .cp-title {
    font-family: 'DM Serif Display', serif;
    font-size: 40px;
    color: #111;
    margin-bottom: 8px;
  }

  .cp-sub { font-size: 14px; color: #777; }

  .cp-divider {
    width: 120px;
    height: 3px;
    background: linear-gradient(to right, #c89b3c, rgba(200,155,60,0.4));
    margin-top: 16px;
    border-radius: 3px;
  }

  .cp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px;
  }

  .cp-card {
    text-decoration: none;
    color: inherit;
    opacity: 0;
    transform: translateY(20px);
    animation: cp-fadeUp 0.5s ease forwards;
  }

  @keyframes cp-fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }

  .cp-inner {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .cp-inner:hover { box-shadow: 0 14px 34px rgba(0,0,0,0.12); }

  .cp-poster-wrap { position: relative; }

  .cp-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    display: block;
    background: #1a1a1a;
  }

  .cp-poster-placeholder {
    width: 100%;
    aspect-ratio: 2/3;
    background: linear-gradient(145deg, #1a1a1a, #2e2e2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }

  .cp-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
    opacity: 0;
    transition: 0.25s;
  }

  .cp-inner:hover .cp-overlay { opacity: 1; }

  .cp-card-body { padding: 12px 14px 14px; }

  .cp-card-title {
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

  .cp-inner:hover .cp-card-title { color: #c89b3c; }

  .cp-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }

  .cp-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    background: #111;
    color: #f5c518;
    padding: 2px 7px;
    border-radius: 10px;
  }

  .cp-reviews {
    font-size: 11px;
    color: #aaa;
  }

  .cp-empty {
    text-align: center;
    padding: 60px;
    color: #888;
    font-size: 15px;
  }

  @media (max-width: 600px) {
    .cp-wrap { padding: 24px 16px 40px; }
    .cp-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .cp-title { font-size: 28px; }
  }
`;

export default function CommunityPicks() {
    const [media,   setMedia]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Backend ranks by community_score = aggregate_rating * LOG(total_reviews + 1)
        // Works on small datasets, no minimum review threshold needed
        axios.get(`${API}/api/community-picks/`)
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
            <div className="cp-wrap">
                <div className="cp-header">
                    <h1 className="cp-title">Community Picks</h1>
                    <p className="cp-sub">Highest rated by our users, weighted by review count</p>
                    <div className="cp-divider" />
                </div>

                {loading && <div className="cp-empty">Loading picks…</div>}

                {!loading && media.length === 0 && (
                    <div className="cp-empty">No community picks yet. Be the first to leave a review!</div>
                )}

                {!loading && media.length > 0 && (
                    <div className="cp-grid">
                        {media.map((item, index) => (
                            <Link
                                key={item.media_id}
                                to={`/media/${item.media_id}`}
                                className="cp-card"
                                style={{ animationDelay: `${index * 0.07}s` }}
                            >
                                <div
                                    className="cp-inner"
                                    onMouseMove={handleMove}
                                    onMouseLeave={handleLeave}
                                >
                                    <div className="cp-poster-wrap">
                                        {item.poster_url
                                            ? <img
                                                src={item.poster_url}
                                                className="cp-poster"
                                                alt={item.title}
                                                onError={e => { e.target.style.display = 'none'; }}
                                              />
                                            : <div className="cp-poster-placeholder">🏆</div>
                                        }
                                        <div className="cp-overlay" />
                                    </div>
                                    <div className="cp-card-body">
                                        <div className="cp-card-title">{item.title}</div>
                                        <div className="cp-card-meta">
                                            {item.aggregate_rating && (
                                                <span className="cp-rating">
                                                    ⭐ {item.aggregate_rating}
                                                </span>
                                            )}
                                            {item.total_reviews > 0 && (
                                                <span className="cp-reviews">
                                                    {item.total_reviews} review{item.total_reviews !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
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