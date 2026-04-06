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

  .tr-header {
    margin-bottom: 36px;
    position: relative;
  }

  .tr-title {
    font-family: 'DM Serif Display', serif;
    font-size: 40px;
    color: #111;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  .tr-sub {
    font-size: 14px;
    color: #777;
  }

  .tr-divider {
    width: 120px;
    height: 3px;
    background: linear-gradient(to right, #1a6b3c, rgba(26,107,60,0.4));
    margin-top: 16px;
    border-radius: 3px;
  }

  .tr-row {
    display: flex;
    justify-content: center;
    gap: 22px;
    margin-bottom: 22px;
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
    width: 200px;
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

  .tr-rank {
    position: absolute;
    top: 10px;
    left: 10px;

    display: flex;
    align-items: center;
    gap: 6px;

    background: rgba(26,107,60,0.95);
    color: #fff;

    padding: 6px;
    border-radius: 999px;

    font-size: 12px;
    white-space: nowrap;

    max-width: 32px;
    overflow: hidden;

    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
    z-index: 3;
  }

  .tr-rank span {
    opacity: 0;
    transform: translateX(-6px);
    transition: 0.25s;
  }

  .tr-inner:hover .tr-rank {
    max-width: 180px;
    padding: 6px 12px;
  }

  .tr-inner:hover .tr-rank span {
    opacity: 1;
    transform: translateX(0);
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

  .tr-inner:hover .tr-overlay { opacity: 1; }

  .tr-card-body { padding: 12px; }

  .tr-card-title {
    font-size: 15px;
    font-weight: 500;
  }

  .tr-inner:hover .tr-card-title {
    color: #1a6b3c;
  }

  .tr-empty {
    text-align: center;
    padding: 60px;
    color: #888;
  }
`;

const CATEGORY = {
    "One Battle After Another": "Best Picture",
    "Sinners": "Best Actor",
    "Hamnet": "Best Actress",
    "Weapons": "Best Supporting Actress",
    "KPop Demon Hunters": "Best Animated Feature",
    "Sentimental Value": "Best International Feature",
    "Frankenstein": "Best Production Design"
};

export default function AwardWinners() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/api/catalog/?type=movie`)
            .then(res => {
                const winners = Object.keys(CATEGORY);
                const filtered = res.data.results.filter(item =>
                    winners.includes(item.title)
                );
                setMedia(filtered);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const firstRow = media.slice(0, 4);
    const secondRow = media.slice(4, 7);

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

            <div className="tr-wrap">
                <div className="tr-header">
                    <h1 className="tr-title">Award Season Winners</h1>
                    <p className="tr-sub">Films being celebrated this year</p>
                    <div className="tr-divider"></div>
                </div>

                {loading && <div className="tr-empty">Loading winners...</div>}

                {!loading && (
                    <>
                        <div className="tr-row">
                            {firstRow.map(item => (
                                <Link key={item.media_id} to={`/media/${item.media_id}`} className="tr-card">
                                    <div
                                        className="tr-inner"
                                        onMouseMove={handleMove}
                                        onMouseLeave={handleLeave}
                                    >
                                        <div className="tr-rank">
                                            🏆 <span>{CATEGORY[item.title]}</span>
                                        </div>

                                        <div className="tr-poster-wrap">
                                            <img src={item.poster_url} className="tr-poster" />
                                            <div className="tr-overlay"></div>
                                        </div>

                                        <div className="tr-card-body">
                                            <div className="tr-card-title">{item.title}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="tr-row">
                            {secondRow.map(item => (
                                <Link key={item.media_id} to={`/media/${item.media_id}`} className="tr-card">
                                    <div
                                        className="tr-inner"
                                        onMouseMove={handleMove}
                                        onMouseLeave={handleLeave}
                                    >
                                        <div className="tr-rank">
                                            🏆 <span>{CATEGORY[item.title]}</span>
                                        </div>

                                        <div className="tr-poster-wrap">
                                            <img src={item.poster_url} className="tr-poster" />
                                            <div className="tr-overlay"></div>
                                        </div>

                                        <div className="tr-card-body">
                                            <div className="tr-card-title">{item.title}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}