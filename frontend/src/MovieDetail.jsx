import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';
const USER_ID = 1;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

  .md-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .md-wrap { font-family: 'DM Sans', sans-serif; color: #1a1a1a; background: #f5f3ef; min-height: 100vh; }

  /* Hero */
  .md-hero { display: flex; gap: 28px; align-items: flex-start; padding: 36px 28px 24px; max-width: 960px; margin: 0 auto; }
  .md-poster { width: 130px; min-width: 130px; height: 190px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.18); }
  .md-poster-placeholder { width: 130px; min-width: 130px; height: 190px; border-radius: 10px; background: #222; display: flex; align-items: center; justify-content: center; font-size: 42px; box-shadow: 0 4px 20px rgba(0,0,0,0.18); }
  .md-hero-info { flex: 1; }
  .md-title { font-family: 'DM Serif Display', serif; font-size: 34px; font-weight: 400; line-height: 1.15; color: #111; margin-bottom: 10px; }
  .md-meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .md-rating-pill { display: inline-flex; align-items: center; gap: 5px; background: #111; color: #f5c518; font-size: 13px; font-weight: 500; padding: 4px 11px; border-radius: 20px; }
  .md-review-count { font-size: 13px; color: #888; }
  .md-desc { font-size: 15px; color: #555; line-height: 1.65; }

  /* Booking notification banner */
  .md-booking-banner { background: #fff; border: 1px solid #b7dfc6; border-left: 4px solid #1a6b3c; border-radius: 10px; padding: 14px 18px; font-size: 14px; color: #1a4a2e; margin: 0 28px 24px; }
  .md-banner-title { font-weight: 500; color: #1a6b3c; margin-bottom: 6px; }
  .md-banner-row { font-size: 13px; color: #2d5a3d; margin-bottom: 3px; }

  /* Body */
  .md-body { max-width: 960px; margin: 0 auto; padding: 0 28px 48px; }
  .md-cols { display: flex; gap: 24px; align-items: flex-start; }
  .md-col-left { flex: 1.1; }
  .md-col-right { flex: 1; }

  /* Cards */
  .md-card { background: #fff; border: 1px solid #e4e0d8; border-radius: 14px; padding: 22px; margin-bottom: 20px; }
  .md-card-title { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #999; margin-bottom: 16px; }

  /* Inputs */
  .review-row { display: flex; gap: 10px; margin-bottom: 10px; }
  .md-input { width: 100%; padding: 10px 14px; border: 1px solid #e0ddd6; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; background: #faf9f7; color: #111; outline: none; transition: border-color 0.15s; }
  .md-input:focus { border-color: #111; background: #fff; }
  .rating-input { width: 90px; flex-shrink: 0; text-align: center; }
  .md-select { width: 100%; padding: 10px 14px; border: 1px solid #e0ddd6; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; background: #faf9f7; color: #111; outline: none; margin-bottom: 14px; cursor: pointer; }
  .md-select:focus { border-color: #111; background: #fff; }

  /* Buttons */
  .btn { padding: 10px 20px; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
  .btn:active { transform: scale(0.98); }
  .btn:hover:not(:disabled) { opacity: 0.88; }
  .btn-dark  { background: #111; color: #fff; width: 100%; padding: 12px; }
  .btn-green { background: #1a6b3c; color: #fff; width: 100%; padding: 12px; }
  .btn-green:disabled { background: #ccc; cursor: not-allowed; }

  /* Seats row */
  .seats-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .seats-label { font-size: 13px; color: #666; flex-shrink: 0; }
  .seats-input { width: 72px; text-align: center; }

  /* Showing summary pill */
  .showing-pill { background: #f0ede7; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #444; margin-bottom: 14px; line-height: 1.5; }
  .showing-pill strong { color: #111; }

  /* Streaming empty state */
  .md-empty { background: #fff; border: 1px solid #e4e0d8; border-radius: 14px; padding: 32px 22px; text-align: center; color: #888; }
  .md-empty-icon { font-size: 32px; margin-bottom: 10px; }
  .md-empty p { font-size: 14px; line-height: 1.6; }

  /* Reviews section */
  .md-reviews { margin-top: 32px; }
  .md-reviews-heading { font-family: 'DM Serif Display', serif; font-size: 22px; font-weight: 400; color: #111; margin-bottom: 16px; }
  .review-card { background: #fff; border: 1px solid #e4e0d8; border-radius: 12px; padding: 16px 20px; margin-bottom: 10px; }
  .review-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .review-author { font-size: 14px; font-weight: 500; color: #111; }
  .review-rating-badge { font-size: 12px; font-weight: 500; background: #111; color: #f5c518; padding: 2px 9px; border-radius: 20px; }
  .review-date { font-size: 12px; color: #aaa; margin-bottom: 8px; }
  .review-text { font-size: 14px; color: #444; line-height: 1.6; }
  .review-no-text { font-size: 13px; color: #bbb; font-style: italic; }

  .md-loading { display: flex; align-items: center; justify-content: center; height: 200px; font-size: 15px; color: #888; }

  @media (max-width: 700px) {
    .md-cols { flex-direction: column; }
    .md-hero  { flex-direction: column; }
  }
`;

function MovieDetail() {
  const { id } = useParams();
  const [data,            setData]           = useState(null);
  const [showtimes,       setShowtimes]      = useState([]);
  const [userBookings,    setUserBookings]   = useState([]);
  const [reviewText,      setReviewText]     = useState('');
  const [rating,          setRating]         = useState(8);
  const [seats,           setSeats]          = useState(1);
  const [selectedShowing, setSelectedShowing]= useState('');
  const [submitting,      setSubmitting]     = useState(false);
  const [booking,         setBooking]        = useState(false);

  const fetchData = () => {
    axios.get(`${API}/api/media/${id}/`).then(res => setData(res.data));

    axios.get(`${API}/api/movie/showtimes/${id}/`).then(res => {
      setShowtimes(res.data);
      if (res.data.length > 0 && res.data[0].showing_id) {
        setSelectedShowing(String(res.data[0].showing_id));
      }
    });

    axios.get(`${API}/api/user/${USER_ID}/bookings/`)
      .then(res => setUserBookings(res.data))
      .catch(() => {});
  };

  useEffect(() => { fetchData(); }, [id]);

  // Only confirmed bookings for this specific movie
  const movieBookings = userBookings.filter(
    b => String(b.media_id) === String(id) && b.booking_status !== 'cancelled'
  );

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/review/`, {
        user_id: USER_ID, media_id: id, rating, review_text: reviewText,
      });
      setReviewText('');
      setRating(8);
      alert('Review submitted!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting review');
    } finally { setSubmitting(false); }
  };

  const bookTicket = async (e) => {
    e.preventDefault();
    if (!selectedShowing || isNaN(selectedShowing)) {
      alert('Please select a valid showtime first!');
      return;
    }
    setBooking(true);
    try {
      await axios.post(`${API}/api/booking/`, {
        user_id:     USER_ID,
        showing_id:  parseInt(selectedShowing),
        seats_booked: parseInt(seats),
      });
      alert('Booking confirmed!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally { setBooking(false); }
  };

  const selectedShow = showtimes.find(s => String(s.showing_id) === String(selectedShowing));

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (!data) return (
    <>
      <style>{styles}</style>
      <div className="md-wrap"><div className="md-loading">Loading…</div></div>
    </>
  );

  const details   = data.details;
  const reviews   = data.reviews || [];
  const posterUrl = details.poster_url;

  return (
    <>
      <style>{styles}</style>
      <div className="md-wrap">

        {/* ── Hero ── */}
        <div className="md-hero">
          {posterUrl
            ? <img className="md-poster" src={posterUrl} alt={details.title} onError={e => { e.target.style.display = 'none'; }} />
            : <div className="md-poster-placeholder">🎬</div>
          }
          <div className="md-hero-info">
            <h1 className="md-title">{details.title}</h1>
            <div className="md-meta-row">
              <span className="md-rating-pill">⭐ {details.aggregate_rating} / 10</span>
              <span className="md-review-count">
                {details.total_reviews} review{details.total_reviews !== 1 ? 's' : ''}
              </span>
            </div>
            {details.description && <p className="md-desc">{details.description}</p>}
          </div>
        </div>

        {/* ── Booking notification banner ── */}
        {movieBookings.length > 0 && (
          <div className="md-booking-banner">
            <div className="md-banner-title">
              ✅ You have {movieBookings.length} active booking{movieBookings.length > 1 ? 's' : ''} for this title
            </div>
            {movieBookings.map(b => (
              <div className="md-banner-row" key={b.booking_id}>
                {b.showing?.screen?.cinema_name} · {b.showing?.show_date} at {b.showing?.show_time?.slice(0, 5)} · {b.seats_booked} seat{b.seats_booked !== 1 ? 's' : ''} · ₹{Number(b.total_price).toLocaleString('en-IN')}
              </div>
            ))}
          </div>
        )}

        {/* ── Main columns ── */}
        <div className="md-body">
          <div className="md-cols">

            {/* LEFT: Review form */}
            <div className="md-col-left">
              <div className="md-card">
                <div className="md-card-title">Leave a Review</div>
                <form onSubmit={submitReview}>
                  <div className="review-row">
                    <input
                      className="md-input rating-input"
                      type="number" min="0" max="10" step="0.1"
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                    />
                    <input
                      className="md-input"
                      type="text"
                      placeholder="Write your review…"
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn btn-dark" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT: Booking */}
            <div className="md-col-right">
              {showtimes.length > 0 ? (
                <div className="md-card">
                  <div className="md-card-title">Book Tickets</div>
                  <form onSubmit={bookTicket}>
                    <select
                      className="md-select"
                      value={selectedShowing}
                      onChange={e => setSelectedShowing(e.target.value)}
                    >
                      <option value="">— Select a showtime —</option>
                      {showtimes.map((s, i) => (
                        <option key={s.showing_id || i} value={String(s.showing_id)}>
                          {`${s.screen?.cinema_name} (${s.screen?.screen_name}) · ${s.show_date} at ${s.show_time} · ₹${s.price} · ${s.available_seats} left`}
                        </option>
                      ))}
                    </select>

                    {selectedShow && (
                      <div className="showing-pill">
                        <strong>{selectedShow.screen?.cinema_name}</strong> — {selectedShow.screen?.cinema_location}<br />
                        {selectedShow.show_date} at {selectedShow.show_time?.slice(0, 5)} · <strong>₹{selectedShow.price}</strong> per seat · {selectedShow.available_seats} seats left
                      </div>
                    )}

                    <div className="seats-row">
                      <span className="seats-label">Seats:</span>
                      <input
                        className="md-input seats-input"
                        type="number" min="1"
                        max={selectedShow?.available_seats || 10}
                        value={seats}
                        onChange={e => setSeats(e.target.value)}
                      />
                      {selectedShow && (
                        <span style={{ fontSize: '13px', color: '#888' }}>
                          Total: <strong style={{ color: '#111' }}>₹{(selectedShow.price * seats).toFixed(2)}</strong>
                        </span>
                      )}
                    </div>

                    <button className="btn btn-green" type="submit" disabled={!selectedShowing || booking}>
                      {booking ? 'Processing…' : 'Confirm Booking'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="md-empty">
                  <div className="md-empty-icon">📺</div>
                  <p>This title is only available for streaming.<br />
                    <span style={{ fontSize: '12px', marginTop: '6px', display: 'block' }}>No theatrical showtimes found.</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Reviews section ── */}
          {reviews.length > 0 && (
            <div className="md-reviews">
              <h2 className="md-reviews-heading">Reviews ({reviews.length})</h2>
              {reviews.map(r => (
                <div className="review-card" key={r.review_id}>
                  <div className="review-card-top">
                    <span className="review-author">{r.user?.name || 'Anonymous'}</span>
                    <span className="review-rating-badge">⭐ {r.rating}</span>
                  </div>
                  <div className="review-date">{formatDate(r.review_date)}</div>
                  {r.review_text
                    ? <p className="review-text">{r.review_text}</p>
                    : <p className="review-no-text">No written review.</p>
                  }
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default MovieDetail;