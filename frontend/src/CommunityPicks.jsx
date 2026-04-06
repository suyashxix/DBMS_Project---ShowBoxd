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
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .cp-inner {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .cp-inner:hover {
    box-shadow: 0 14px 34px rgba(0,0,0,0.12);
  }

  .cp-poster-wrap { position: relative; }

  .cp-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
  }

  .cp-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
    opacity: 0;
    transition: 0.25s;
  }

  .cp-inner:hover .cp-overlay {
    opacity: 1;
  }

  .cp-card-body { padding: 12px; }

  .cp-card-title {
    font-size: 15px;
    font-weight: 500;
  }

  .cp-rating {
    font-size: 13px;
    margin-top: 4px;
    color: #c89b3c;
  }

  .cp-empty {
    text-align: center;
    padding: 60px;
    color: #888;
  }
`;

export default function CommunityPicks() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/api/catalog/`)
            .then(res => {
                const filtered = res.data.results
                    .filter(item =>
                        item.aggregate_rating &&
                        item.total_reviews > 5 &&
                        item.release_date &&
                        new Date(item.release_date) <= new Date()
                    )
                    .sort((a, b) => {
                        const scoreA = (a.aggregate_rating || 0) * Math.log10((a.total_reviews || 1) + 1);
                        const scoreB = (b.aggregate_rating || 0) * Math.log10((b.total_reviews || 1) + 1);
                        return scoreB - scoreA;
                    });

                setMedia(filtered.slice(0, 24));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleMove = (e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const midX = rect.width / 2;
        const midY = rect.height / 2;

        const rotateX = ((y - midY) / midY) * -10;
        const rotateY = ((x - midX) / midX) * 10;

        el.style.transform = `
            perspective(800px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale(1.04)
        `;
    };

    const handleLeave = (e) => {
        e.currentTarget.style.transform =
            "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    };

    return (
        <>
            <style>{styles}</style>

            <div className="cp-wrap">
                <div className="cp-header">
                    <h1 className="cp-title">Community Picks This Month</h1>
                    <p className="cp-sub">Top rated movies and shows from users</p>
                    <div className="cp-divider"></div>
                </div>

                {loading && <div className="cp-empty">Loading picks...</div>}

                {!loading && (
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
                                        <img src={item.poster_url} className="cp-poster" />
                                        <div className="cp-overlay"></div>
                                    </div>

                                    <div className="cp-card-body">
                                        <div className="cp-card-title">{item.title}</div>
                                        <div className="cp-rating">
                                            ⭐ {item.aggregate_rating || "N/A"} / 10
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