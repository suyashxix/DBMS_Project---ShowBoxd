import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

  .tr-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .tr-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 40px 28px 60px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .tr-header { margin-bottom: 36px; }

  .tr-title {
    font-family: 'DM Serif Display', serif;
    font-size: 40px;
    color: #111;
    margin-bottom: 8px;
  }

  .tr-sub { font-size: 14px; color: #777; }

  .tr-divider {
    width: 120px;
    height: 3px;
    background: linear-gradient(to right, #c89b3c, rgba(200,155,60,0.4));
    margin-top: 16px;
    border-radius: 3px;
  }

  .tr-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px;
  }

  .tr-card {
    text-decoration: none;
    color: inherit;
    opacity: 0;
    transform: translateY(20px);
    animation: tr-fadeUp 0.5s ease forwards;
  }

  @keyframes tr-fadeUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tr-inner {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .tr-inner:hover {
    box-shadow: 0 14px 34px rgba(0,0,0,0.12);
  }

  .tr-poster-wrap { position: relative; }

  .tr-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
  }

  .tr-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
    opacity: 0;
    transition: 0.25s;
  }

  .tr-inner:hover .tr-overlay {
    opacity: 1;
  }

  .tr-card-body { padding: 12px; }

  .tr-card-title {
    font-size: 15px;
    font-weight: 500;
  }

  .tr-date {
    font-size: 12px;
    color: #c89b3c;
    margin-top: 4px;
  }

  .tr-empty {
    text-align: center;
    padding: 60px;
    color: #888;
  }
`;

export default function ComingSoon() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/api/catalog/?type=movie`)
            .then(res => {
                const today = new Date();

                const filtered = res.data.results
                    .map(item => {
                        const date = item.release_date || item.extra?.release_date;
                        return {
                            ...item,
                            parsed_date: date ? new Date(date + "T00:00:00") : null
                        };
                    })
                    .filter(item =>
                        item.parsed_date && item.parsed_date > today
                    )
                    .sort((a, b) =>
                        a.parsed_date.getTime() - b.parsed_date.getTime()
                    );

                setMedia(filtered);
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

    const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.toLocaleString('en-GB', { month: 'short' });
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    };

    return (
        <>
            <style>{styles}</style>

            <div className="tr-wrap">
                <div className="tr-header">
                    <h1 className="tr-title">Most Anticipated Releases</h1>
                    <p className="tr-sub">Upcoming movies you shouldn’t miss</p>
                    <div className="tr-divider"></div>
                </div>

                {loading && <div className="tr-empty">Loading movies...</div>}

                {!loading && (
                    <div className="tr-grid">
                        {media.map((item, index) => (
                            <Link
                                key={item.media_id}
                                to={`/media/${item.media_id}`}
                                className="tr-card"
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                <div
                                    className="tr-inner"
                                    onMouseMove={handleMove}
                                    onMouseLeave={handleLeave}
                                >
                                    <div className="tr-poster-wrap">
                                        <img src={item.poster_url} className="tr-poster" />
                                        <div className="tr-overlay"></div>
                                    </div>

                                    <div className="tr-card-body">
                                        <div className="tr-card-title">{item.title}</div>
                                        <div className="tr-date">
                                            {formatDate(item.parsed_date)}
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