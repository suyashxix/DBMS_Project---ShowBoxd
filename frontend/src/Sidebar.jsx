import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

  .sb-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 200;
    backdrop-filter: blur(4px);
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
    width: 340px;
    max-width: 90vw;
    background: linear-gradient(to bottom, #0f0f0f, #1a1a1a);
    z-index: 201;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    animation: sb-slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
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
    padding: 22px 24px 20px;
    border-bottom: 1px solid #252525;
    flex-shrink: 0;
  }
  .sb-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sb-brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #d4a853, #b8923f);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(212,168,83,0.3);
  }
  .sb-brand-icon svg {
    width: 22px;
    height: 22px;
    color: #111;
  }
  .sb-brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: #fff;
    letter-spacing: -0.01em;
  }
  .sb-close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #333;
    background: #1f1f1f;
    color: #888;
    font-size: 18px;
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
    padding: 12px 0 40px;
    flex: 1;
  }

  /* Section */
  .sb-section {
    padding: 24px 0 12px;
    border-bottom: 1px solid #1e1e1e;
  }
  .sb-section:last-child { border-bottom: none; }

  .sb-section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 24px 14px;
  }
  .sb-section-icon {
    width: 22px;
    height: 22px;
    color: #d4a853;
  }
  .sb-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    font-weight: 400;
    color: #fff;
  }

  /* Items */
  .sb-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px 12px 58px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #999;
    cursor: pointer;
    transition: all 0.15s;
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
    background: linear-gradient(to bottom, #d4a853, #b8923f);
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
    gap: 10px;
    padding: 6px 24px 10px 58px;
  }
  .sb-genre-pill {
    padding: 7px 14px;
    border-radius: 20px;
    border: 1px solid #2a2a2a;
    background: #1a1a1a;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #888;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .sb-genre-pill:hover {
    border-color: #d4a853;
    color: #d4a853;
    background: rgba(212,168,83,0.1);
  }

  /* Animated stagger */
  .sb-item, .sb-genre-pill {
    animation: sb-item-in 0.35s ease both;
  }
  @keyframes sb-item-in {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

const GENRES = [
  'Action', 'Comedy', 'Drama', 'Thriller', 'Horror',
  'Romance', 'Sci-Fi', 'Animation', 'Documentary', 'Fantasy',
  'Crime', 'Adventure', 'Mystery', 'Biography',
];

// Icons
const FilmIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
  </svg>
);

const MovieIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TvIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TagIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const StarIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

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
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-brand-icon">
              <FilmIcon />
            </div>
            <span className="sb-brand-name">Cinelog</span>
          </div>
          <button className="sb-close" onClick={onClose}>x</button>
        </div>

        <div className="sb-content">
          {/* Movies */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon"><MovieIcon /></span>
              <span className="sb-section-title">Movies</span>
            </div>
            <button className="sb-item" style={{animationDelay:'0.05s'}} onClick={() => go('/home?type=movie')}>All Movies</button>
            <button className="sb-item" style={{animationDelay:'0.08s'}} onClick={() => go('/home?top_rated=true&type=movie')}>Top 100 Rated</button>
            <button className="sb-item" style={{animationDelay:'0.11s'}} onClick={() => go('/trending')}>Trending Now</button>
            <button className="sb-item" style={{animationDelay:'0.14s'}} onClick={() => go('/home?type=movie&sort=release_date')}>New Releases</button>
            <button className="sb-item" style={{animationDelay:'0.17s'}} onClick={() => go('/showtimes')}>Showtimes & Tickets</button>
          </div>

          {/* TV Shows */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon"><TvIcon /></span>
              <span className="sb-section-title">TV Shows</span>
            </div>
            <button className="sb-item" style={{animationDelay:'0.05s'}} onClick={() => go('/home?type=tv_show')}>All TV Shows</button>
            <button className="sb-item" style={{animationDelay:'0.08s'}} onClick={() => go('/home?top_rated=true&type=tv_show')}>Top Rated Shows</button>
            <button className="sb-item" style={{animationDelay:'0.11s'}} onClick={() => go('/home?type=tv_show&status=ongoing')}>Currently Airing</button>
          </div>

          {/* Browse by Genre */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon"><TagIcon /></span>
              <span className="sb-section-title">Browse by Genre</span>
            </div>
            <div className="sb-genres">
              {GENRES.map((g, i) => (
                <button
                  key={g}
                  className="sb-genre-pill"
                  style={{ animationDelay: `${0.05 + i * 0.03}s` }}
                  onClick={() => go(`/?genre=${encodeURIComponent(g)}`)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* My Space */}
          <div className="sb-section">
            <div className="sb-section-header">
              <span className="sb-section-icon"><StarIcon /></span>
              <span className="sb-section-title">My Space</span>
            </div>
            <button className="sb-item" style={{animationDelay:'0.05s'}} onClick={() => go('/watchlist')}>My Watchlist</button>
            <button className="sb-item" style={{animationDelay:'0.08s'}} onClick={() => go('/bookings')}>My Bookings</button>
            <button className="sb-item" style={{animationDelay:'0.11s'}} onClick={() => go('/history')}>Watch History</button>
          </div>
        </div>
      </div>
    </>
  );
}