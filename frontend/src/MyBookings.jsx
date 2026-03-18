import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';
const USER_ID = 1;

const PLACEHOLDER = 'https://via.placeholder.com/80x110/1a1a1a/666?text=No+Poster';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');
  .mb-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .mb-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    padding: 36px 28px;
    max-width: 860px;
    margin: 0 auto;
  }
  .mb-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    font-weight: 400;
    color: #111;
    margin-bottom: 6px;
  }
  .mb-sub { font-size: 14px; color: #888; margin-bottom: 32px; }

  /* Movie group */
  .mb-group { margin-bottom: 32px; }
  .mb-group-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e0d8;
  }
  .mb-poster {
    width: 52px;
    height: 72px;
    object-fit: cover;
    border-radius: 6px;
    background: #ddd;
    flex-shrink: 0;
  }
  .mb-poster-placeholder {
    width: 52px;
    height: 72px;
    border-radius: 6px;
    background: #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .mb-movie-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #111;
    text-decoration: none;
  }
  .mb-movie-title:hover { text-decoration: underline; }
  .mb-movie-count { font-size: 13px; color: #888; margin-top: 2px; }

  /* Booking card */
  .mb-card {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 10px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .mb-card-main { flex: 1; }
  .mb-card-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
  .mb-card-title { font-size: 14px; font-weight: 500; color: #111; }
  .mb-card-sub { font-size: 13px; color: #666; }
  .mb-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 9px;
    border-radius: 20px;
    flex-shrink: 0;
  }
  .mb-badge-confirmed { background: #d4edda; color: #1a6b3c; }
  .mb-badge-cancelled { background: #f8d7da; color: #842029; }
  .mb-price { font-size: 15px; font-weight: 500; color: #111; text-align: right; flex-shrink: 0; }
  .mb-price-sub { font-size: 12px; color: #888; text-align: right; }

  .mb-empty {
    text-align: center;
    padding: 60px 20px;
    color: #888;
    font-size: 15px;
  }
  .mb-empty a { color: #111; font-weight: 500; }
  .mb-loading { text-align: center; padding: 60px; color: #888; }
`;

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/user/${USER_ID}/bookings/`)
      .then(res => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  // Group by media_id
  const groups = bookings.reduce((acc, b) => {
    const key = b.media_id;
    if (!acc[key]) acc[key] = { title: b.media_title, poster: b.poster_url, media_id: b.media_id, items: [] };
    acc[key].items.push(b);
    return acc;
  }, {});

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="mb-wrap">
        <h1 className="mb-heading">My Bookings</h1>
        <p className="mb-sub">All ticket bookings for your account</p>

        {loading && <div className="mb-loading">Loading…</div>}

        {!loading && Object.keys(groups).length === 0 && (
          <div className="mb-empty">
            <p>No bookings yet. <Link to="/">Browse movies</Link> to book tickets.</p>
          </div>
        )}

        {Object.values(groups).map(group => (
          <div className="mb-group" key={group.media_id}>
            <div className="mb-group-header">
              {group.poster
                ? <img className="mb-poster" src={group.poster} alt={group.title} onError={e => { e.target.style.display='none'; }} />
                : <div className="mb-poster-placeholder">🎬</div>
              }
              <div>
                <Link to={`/media/${group.media_id}`} className="mb-movie-title">{group.title}</Link>
                <div className="mb-movie-count">{group.items.length} booking{group.items.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {group.items.map(b => (
              <div className="mb-card" key={b.booking_id}>
                <div className="mb-card-main">
                  <div className="mb-card-row">
                    <span className="mb-card-title">
                      {b.showing?.screen?.cinema_name || 'Cinema'}
                    </span>
                    <span className={`mb-badge ${b.booking_status === 'cancelled' ? 'mb-badge-cancelled' : 'mb-badge-confirmed'}`}>
                      {b.booking_status}
                    </span>
                  </div>
                  <div className="mb-card-sub">
                    {b.showing?.screen?.screen_name} · {b.showing?.show_date} at {b.showing?.show_time?.slice(0, 5)}
                  </div>
                  <div className="mb-card-sub" style={{ marginTop: '4px' }}>
                    {b.seats_booked} seat{b.seats_booked !== 1 ? 's' : ''} · Booked on {formatDate(b.booking_time)}
                  </div>
                </div>
                <div>
                  <div className="mb-price">₹{Number(b.total_price).toLocaleString('en-IN')}</div>
                  <div className="mb-price-sub">total</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}