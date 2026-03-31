import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './Authcontext';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .wl-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .wl-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 36px 28px 56px;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Page header */
  .wl-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
    animation: wl-fade-up 0.4s ease both;
  }
  .wl-title {
    font-family: 'DM Serif Display', serif;
    font-size: 34px;
    font-weight: 400;
    color: #111;
    line-height: 1.1;
    margin-bottom: 6px;
  }
  .wl-title em { font-style: italic; color: #1a6b3c; }
  .wl-sub { font-size: 14px; color: #888; }

  @keyframes wl-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Visibility toggle */
  .wl-vis-tabs {
    display: flex;
    background: #ede9e3;
    border-radius: 10px;
    padding: 4px;
    gap: 2px;
    flex-shrink: 0;
  }
  .wl-vis-tab {
    padding: 7px 16px;
    border-radius: 7px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    background: transparent;
    color: #999;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .wl-vis-tab.active { background: #fff; color: #111; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

  /* Grid */
  .wl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
    animation: wl-fade-up 0.4s 0.08s ease both;
  }

  /* Card */
  .wl-card {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s;
    position: relative;
  }
  .wl-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }

  .wl-card-link {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .wl-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    background: #1a1a1a;
    display: block;
  }
  .wl-poster-placeholder {
    width: 100%;
    aspect-ratio: 2/3;
    background: linear-gradient(145deg, #1a1a1a, #2e2e2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
  }
  .wl-card-body {
    padding: 11px 13px 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .wl-card-title {
    font-size: 13px;
    font-weight: 500;
    color: #111;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .wl-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }
  .wl-card-rating {
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
  .wl-card-type { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; }

  /* Remove button */
  .wl-remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: none;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;
    z-index: 2;
  }
  .wl-card:hover .wl-remove-btn { opacity: 1; }
  .wl-remove-btn:hover { background: rgba(192,57,43,0.85); }

  /* Added date */
  .wl-added-date {
    font-size: 11px;
    color: #bbb;
    padding: 0 13px 10px;
  }

  /* Empty state */
  .wl-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #888;
  }
  .wl-empty-icon { font-size: 40px; margin-bottom: 14px; }
  .wl-empty-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #111; margin-bottom: 8px; }
  .wl-empty-sub { font-size: 14px; color: #999; margin-bottom: 20px; }
  .wl-browse-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 22px;
    background: #111;
    color: #fff;
    border-radius: 9px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
  }
  .wl-browse-btn:hover { opacity: 0.85; }

  /* Loading */
  .wl-loading { text-align: center; padding: 60px; color: #888; }

  /* Guest banner */
  .wl-guest {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 18px;
    padding: 52px 40px;
    text-align: center;
    max-width: 480px;
    margin: 60px auto 0;
    animation: wl-fade-up 0.4s ease both;
  }
  .wl-guest-icon { font-size: 44px; margin-bottom: 18px; }
  .wl-guest-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #111;
    margin-bottom: 10px;
  }
  .wl-guest-sub { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 24px; }
  .wl-guest-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 28px;
    background: #111;
    color: #fff;
    border-radius: 10px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s;
  }
  .wl-guest-btn:hover { opacity: 0.85; }
  .wl-guest-note { font-size: 12px; color: #bbb; margin-top: 14px; }

  /* Count badge */
  .wl-count {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    background: #f5f3ef;
    border-radius: 20px;
    font-size: 12px;
    color: #888;
    margin-left: 8px;
    vertical-align: middle;
  }

  @media (max-width: 600px) {
    .wl-wrap { padding: 24px 16px 40px; }
    .wl-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .wl-title { font-size: 26px; }
  }
`;

function GuestView() {
  return (
    <div className="wl-guest">
      <div className="wl-guest-icon">📋</div>
      <div className="wl-guest-title">Your Watchlist</div>
      <p className="wl-guest-sub">
        Sign in to save movies and shows you want to watch. Your watchlist syncs across all your devices.
      </p>
      <Link to="/login" className="wl-guest-btn">Sign In to View Watchlist</Link>
      <p className="wl-guest-note">Don't have an account? You can create one for free.</p>
    </div>
  );
}

export default function Watchlist() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [visibility, setVisibility] = useState('private');
  const [removing,   setRemoving]   = useState(null);

  const fetchWatchlist = () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    axios.get(`${API}/api/watchlist/${user.user_id}/${visibility}/`)
      .then(res => setItems(Array.isArray(res.data) ? res.data : (res.data.results ?? [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWatchlist(); }, [user, visibility]);

  const removeItem = async (mediaId) => {
    setRemoving(mediaId);
    try {
      await axios.delete(`${API}/api/watchlist/remove/`, {
        data: { user_id: user.user_id, media_id: mediaId, visibility },
      });
      setItems(prev => prev.filter(i => (i.media_id ?? i.media?.media_id) !== mediaId));
    } catch {
      // silently ignore
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper — watchlist items from the API may nest media fields differently
  const getField = (item, field) => item[field] ?? item.media?.[field];

  if (!user) return (
    <>
      <style>{styles}</style>
      <div className="wl-wrap"><GuestView /></div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="wl-wrap">

        <div className="wl-header">
          <div>
            <h1 className="wl-title">My <em>Watchlist</em>
              {!loading && <span className="wl-count">{items.length}</span>}
            </h1>
            <p className="wl-sub">Titles you've saved to watch later</p>
          </div>

          <div className="wl-vis-tabs">
            <button
              className={`wl-vis-tab ${visibility === 'private' ? 'active' : ''}`}
              onClick={() => setVisibility('private')}
            >
              🔒 Private
            </button>
            <button
              className={`wl-vis-tab ${visibility === 'public' ? 'active' : ''}`}
              onClick={() => setVisibility('public')}
            >
              🌍 Public
            </button>
          </div>
        </div>

        {loading && <div className="wl-loading">Loading your watchlist…</div>}

        {!loading && (
          <div className="wl-grid">
            {items.length === 0 ? (
              <div className="wl-empty">
                <div className="wl-empty-icon">{visibility === 'private' ? '🔒' : '🌍'}</div>
                <div className="wl-empty-title">Nothing here yet</div>
                <p className="wl-empty-sub">
                  {visibility === 'private'
                    ? 'Add movies and shows from their detail pages to build your private list.'
                    : 'You haven\'t added anything to your public watchlist yet.'}
                </p>
                <Link to="/home" className="wl-browse-btn">Browse Titles</Link>
              </div>
            ) : (
              items.map(item => {
                const mediaId   = getField(item, 'media_id');
                const title     = getField(item, 'title');
                const posterUrl = getField(item, 'poster_url');
                const rating    = getField(item, 'aggregate_rating');
                const mediaType = getField(item, 'media_type');

                return (
                  <div className="wl-card" key={mediaId}>
                    <button
                      className="wl-remove-btn"
                      title="Remove from watchlist"
                      disabled={removing === mediaId}
                      onClick={() => removeItem(mediaId)}
                    >
                      {removing === mediaId ? '…' : '✕'}
                    </button>

                    <Link to={`/media/${mediaId}`} className="wl-card-link">
                      {posterUrl
                        ? <img className="wl-poster" src={posterUrl} alt={title}
                            onError={e => { e.target.style.display = 'none'; }} />
                        : <div className="wl-poster-placeholder">🎬</div>
                      }
                      <div className="wl-card-body">
                        <div className="wl-card-title">{title}</div>
                        <div className="wl-card-meta">
                          {rating
                            ? <span className="wl-card-rating">⭐ {rating}</span>
                            : <span className="wl-card-rating" style={{ background: '#ccc', color: '#666' }}>NR</span>
                          }
                          <span className="wl-card-type">{mediaType === 'tv_show' ? 'TV' : 'Film'}</span>
                        </div>
                      </div>
                    </Link>
                    {item.added_at && (
                      <div className="wl-added-date">Added {formatDate(item.added_at)}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}