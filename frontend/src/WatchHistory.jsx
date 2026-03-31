import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './Authcontext';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .wh-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .wh-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 36px 28px 56px;
    max-width: 860px;
    margin: 0 auto;
  }

  /* Header */
  .wh-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
    animation: wh-fade-up 0.4s ease both;
  }
  .wh-title {
    font-family: 'DM Serif Display', serif;
    font-size: 34px;
    font-weight: 400;
    color: #111;
    line-height: 1.1;
    margin-bottom: 6px;
  }
  .wh-title em { font-style: italic; color: #1a6b3c; }
  .wh-sub { font-size: 14px; color: #888; }

  @keyframes wh-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Limit selector */
  .wh-limit-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .wh-limit-label { font-size: 12px; color: #999; }
  .wh-limit-select {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #e0ddd6;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    outline: none;
  }
  .wh-limit-select:focus { border-color: #111; }

  /* Timeline groups */
  .wh-groups {
    display: flex;
    flex-direction: column;
    gap: 28px;
    animation: wh-fade-up 0.4s 0.06s ease both;
  }

  .wh-day-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #bbb;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wh-day-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8e4de;
  }

  /* History entry card */
  .wh-card {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 8px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .wh-card:hover { transform: translateX(4px); box-shadow: 0 2px 14px rgba(0,0,0,0.07); }

  .wh-poster {
    width: 44px;
    height: 62px;
    border-radius: 6px;
    object-fit: cover;
    background: #1a1a1a;
    flex-shrink: 0;
    display: block;
  }
  .wh-poster-placeholder {
    width: 44px;
    height: 62px;
    border-radius: 6px;
    background: linear-gradient(145deg, #1a1a1a, #2e2e2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .wh-card-info { flex: 1; min-width: 0; }
  .wh-card-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .wh-card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .wh-type-badge {
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .wh-episode-badge {
    font-size: 11px;
    background: #f0ede7;
    color: #555;
    padding: 2px 7px;
    border-radius: 8px;
  }
  .wh-rating {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 500;
    background: #111;
    color: #f5c518;
    padding: 2px 7px;
    border-radius: 10px;
  }

  .wh-card-time {
    font-size: 12px;
    color: #bbb;
    flex-shrink: 0;
    text-align: right;
  }

  /* Loading / empty */
  .wh-loading { text-align: center; padding: 60px; color: #888; }
  .wh-empty {
    text-align: center;
    padding: 60px 20px;
    color: #888;
  }
  .wh-empty-icon { font-size: 40px; margin-bottom: 14px; }
  .wh-empty-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #111; margin-bottom: 8px; }
  .wh-empty-sub { font-size: 14px; color: #999; margin-bottom: 20px; }
  .wh-browse-btn {
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
  .wh-browse-btn:hover { opacity: 0.85; }

  /* Guest */
  .wh-guest {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 18px;
    padding: 52px 40px;
    text-align: center;
    max-width: 480px;
    margin: 60px auto 0;
    animation: wh-fade-up 0.4s ease both;
  }
  .wh-guest-icon { font-size: 44px; margin-bottom: 18px; }
  .wh-guest-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #111;
    margin-bottom: 10px;
  }
  .wh-guest-sub { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 24px; }
  .wh-guest-btn {
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
  .wh-guest-btn:hover { opacity: 0.85; }
  .wh-guest-note { font-size: 12px; color: #bbb; margin-top: 14px; }

  @media (max-width: 600px) {
    .wh-wrap { padding: 24px 16px 40px; }
    .wh-title { font-size: 26px; }
  }
`;

function GuestView() {
  return (
    <div className="wh-guest">
      <div className="wh-guest-icon">🕐</div>
      <div className="wh-guest-title">Watch History</div>
      <p className="wh-guest-sub">
        Sign in to see everything you've watched. Your history is saved automatically as you browse.
      </p>
      <Link to="/login" className="wh-guest-btn">Sign In to View History</Link>
      <p className="wh-guest-note">Your history is private and only visible to you.</p>
    </div>
  );
}

// Group history entries by calendar date
function groupByDate(items) {
  const groups = {};
  for (const item of items) {
    const date = item.watched_at
      ? new Date(item.watched_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Unknown date';
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  return groups;
}

function formatTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function WatchHistory() {
  const { user } = useAuth();

  const [history, setHistory]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [limit,   setLimit]    = useState(50);

  const fetchHistory = () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    axios.get(`${API}/api/user/${user.user_id}/history/`, { params: { limit } })
      .then(res => setHistory(Array.isArray(res.data) ? res.data : (res.data.results ?? [])))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, [user, limit]);

  const getField = (item, field) => item[field] ?? item.media?.[field];

  if (!user) return (
    <>
      <style>{styles}</style>
      <div className="wh-wrap"><GuestView /></div>
    </>
  );

  const groups = groupByDate(history);

  return (
    <>
      <style>{styles}</style>
      <div className="wh-wrap">

        <div className="wh-header">
          <div>
            <h1 className="wh-title">Watch <em>History</em></h1>
            <p className="wh-sub">{history.length} title{history.length !== 1 ? 's' : ''} watched</p>
          </div>

          <div className="wh-limit-wrap">
            <span className="wh-limit-label">Show last</span>
            <select
              className="wh-limit-select"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>All</option>
            </select>
          </div>
        </div>

        {loading && <div className="wh-loading">Loading your history…</div>}

        {!loading && history.length === 0 && (
          <div className="wh-empty">
            <div className="wh-empty-icon">🕐</div>
            <div className="wh-empty-title">Nothing watched yet</div>
            <p className="wh-empty-sub">Your watch history will appear here after you start watching titles.</p>
            <Link to="/home" className="wh-browse-btn">Browse Titles</Link>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="wh-groups">
            {Object.entries(groups).map(([date, entries]) => (
              <div key={date}>
                <div className="wh-day-label">{date}</div>
                {entries.map((item, idx) => {
                  const mediaId   = getField(item, 'media_id');
                  const title     = getField(item, 'title');
                  const posterUrl = getField(item, 'poster_url');
                  const rating    = getField(item, 'aggregate_rating');
                  const mediaType = getField(item, 'media_type');
                  const episode   = item.episode;

                  return (
                    <Link
                      to={`/media/${mediaId}`}
                      className="wh-card"
                      key={`${mediaId}-${idx}`}
                    >
                      {posterUrl
                        ? <img className="wh-poster" src={posterUrl} alt={title}
                            onError={e => { e.target.style.display = 'none'; }} />
                        : <div className="wh-poster-placeholder">🎬</div>
                      }

                      <div className="wh-card-info">
                        <div className="wh-card-title">{title || 'Untitled'}</div>
                        <div className="wh-card-meta">
                          <span className="wh-type-badge">
                            {mediaType === 'tv_show' ? 'TV' : 'Film'}
                          </span>
                          {episode && (
                            <span className="wh-episode-badge">
                              S{episode.season_number} E{episode.episode_number}
                            </span>
                          )}
                          {rating && (
                            <span className="wh-rating">⭐ {rating}</span>
                          )}
                        </div>
                      </div>

                      <div className="wh-card-time">
                        {formatTime(item.watched_at)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}