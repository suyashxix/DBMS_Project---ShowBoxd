import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .sb-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 200;
    backdrop-filter: blur(2px);
    animation: sb-overlay-in 0.25s ease both;
  }
  @keyframes sb-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .sb-panel {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    max-width: 88vw;
    background: #111;
    z-index: 201;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    animation: sb-slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    scrollbar-width: thin;
    scrollbar-color: #333 transparent;
  }
  @keyframes sb-slide-in {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }
  .sb-panel.closing {
    animation: sb-slide-out 0.25s cubic-bezier(0.55, 0, 0.8, 0.45) both;
  }
  .sb-overlay.closing {
    animation: sb-overlay-out 0.25s ease both;
  }
  @keyframes sb-slide-out {
    to { transform: translateX(-100%); }
  }
  @keyframes sb-overlay-out {
    to { opacity: 0; }
  }

  /* Header */
  .sb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 16px;
    border-bottom: 1px solid #222;
    flex-shrink: 0;
  }
  .sb-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sb-brand-icon {
    width: 34px;
    height: 34px;
    background: #1a6b3c;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .sb-brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: #fff;
  }
  .sb-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid #333;
    background: #1a1a1a;
    color: #aaa;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    line-height: 1;
  }
  .sb-close:hover { background: #2a2a2a; color: #fff; border-color: #444; }

  /* Content */
  .sb-content {
    padding: 8px 0 32px;
    flex: 1;
  }

  /* Section */
  .sb-section {
    padding: 20px 0 8px;
    border-bottom: 1px solid #1e1e1e;
  }
  .sb-section:last-child { border-bottom: none; }

  .sb-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 20px 10px;
  }
  .sb-section-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }
  .sb-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 17px;
    font-weight: 400;
    color: #fff;
  }

  /* Items */
  .sb-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px 9px 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #aaa;
    cursor: pointer;
    transition: all 0.12s;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    position: relative;
  }
  .sb-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #1a6b3c;
    border-radius: 0 2px 2px 0;
    transform: scaleY(0);
    transition: transform 0.15s;
  }
  .sb-item:hover {
    color: #fff;
    background: rgba(255,255,255,0.04);
  }
  .sb-item:hover::before { transform: scaleY(1); }

  /* Genre pills */
  .sb-genres {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 20px 8px 50px;
  }
  .sb-genre-pill {
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid #2a2a2a;
    background: #1a1a1a;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #888;
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
  }
  .sb-genre-pill:hover {
    border-color: #1a6b3c;
    color: #4caf7a;
    background: rgba(26,107,60,0.12);
  }

  /* Animated stagger */
  .sb-item, .sb-genre-pill {
    animation: sb-item-in 0.3s ease both;
  }
`;

const GENRES = [
  'Action', 'Comedy', 'Drama', 'Thriller', 'Horror',
  'Romance', 'Sci-Fi', 'Animation', 'Documentary', 'Fantasy',
  'Crime', 'Adventure', 'Mystery', 'Biography',
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const go = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sb-overlay" ref={overlayRef} onClick={onClose} />
      <div className="sb-panel" ref={panelRef}>

        {/* Header */}
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-brand-icon">🎬</div>
            <span className="sb-brand-name">Cinélog</span>
          </div>
          <button className="sb-close" onClick={onClose}>✕</button>
        </div>

        <div className="sb-content">

          {/* Movies */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon">🎥</span>
              <span className="sb-section-title">Movies</span>
            </div>
            <button className="sb-item" onClick={() => go('/home?type=movie')}>All Movies</button>
            <button className="sb-item" onClick={() => go('/home?top_rated=true&type=movie')}>Top 100 Rated</button>
            <button className="sb-item" onClick={() => go('/trending')}>Trending Now</button>
            <button className="sb-item" onClick={() => go('/home?type=movie&sort=release_date')}>New Releases</button>
            <button className="sb-item" onClick={() => go('/showtimes')}>Showtimes & Tickets</button>
          </div>

          {/* TV Shows */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon">📺</span>
              <span className="sb-section-title">TV Shows</span>
            </div>
            <button className="sb-item" onClick={() => go('/home?type=tv_show')}>All TV Shows</button>
            <button className="sb-item" onClick={() => go('/home?top_rated=true&type=tv_show')}>Top Rated Shows</button>
            <button className="sb-item" onClick={() => go('/home?type=tv_show&status=ongoing')}>Currently Airing</button>
          </div>

          {/* Browse by Genre */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon">🏷</span>
              <span className="sb-section-title">Browse by Genre</span>
            </div>
            <div className="sb-genres">
              {GENRES.map((g, i) => (
                <button
                  key={g}
                  className="sb-genre-pill"
                  style={{ animationDelay: `${i * 0.03}s` }}
                  onClick={() => go(`/?genre=${encodeURIComponent(g)}`)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Watchlist & History */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon">⭐</span>
              <span className="sb-section-title">My Space</span>
            </div>
            <button className="sb-item" onClick={() => go('/watchlist')}>My Watchlist</button>
            <button className="sb-item" onClick={() => go('/bookings')}>My Bookings</button>
            <button className="sb-item" onClick={() => go('/history')}>Watch History</button>
          </div>

        </div>
      </div>
    </>
  );
}