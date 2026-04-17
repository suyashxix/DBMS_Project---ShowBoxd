import { useState, useEffect } from 'react';
import { useAuth } from './Authcontext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const styles = `
  .bm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }

  .bm-modal {
    background: #fff;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .bm-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #e4e0d8;
  }

  .bm-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #f5f3ef;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20px;
  }

  .bm-close:hover {
    background: #e4e0d8;
    color: #000;
  }

  .bm-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px;
    color: #111;
    margin-bottom: 4px;
  }

  .bm-subtitle {
    font-size: 14px;
    color: #666;
  }

  .bm-body {
    padding: 24px;
  }

  .bm-field {
    margin-bottom: 20px;
  }

  .bm-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #111;
    margin-bottom: 8px;
  }

  .bm-select,
  .bm-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e0ddd6;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    background: #faf9f7;
    color: #111;
  }

  .bm-select:focus,
  .bm-input:focus {
    outline: none;
    border-color: #1a6b3c;
    background: #fff;
  }

  .bm-info {
    background: #f5f3ef;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 20px;
  }

  .bm-info-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .bm-info-row:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #e4e0d8;
    font-weight: 600;
  }

  .bm-info-label {
    color: #666;
  }

  .bm-info-value {
    color: #111;
  }

  .bm-actions {
    display: flex;
    gap: 12px;
  }

  .bm-btn {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .bm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .bm-btn-cancel {
    background: #f5f3ef;
    border: 1px solid #e4e0d8;
    color: #666;
  }

  .bm-btn-cancel:hover:not(:disabled) {
    background: #e4e0d8;
  }

  .bm-btn-confirm {
    background: #1a6b3c;
    border: none;
    color: #fff;
  }

  .bm-btn-confirm:hover:not(:disabled) {
    opacity: 0.9;
  }

  .bm-empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }

  .bm-loading {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }
`;

export default function BookingModal({ mediaId, mediaTitle, onClose }) {
  const { user } = useAuth();
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedShowing, setSelectedShowing] = useState('');
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    fetchShowtimes();
  }, [mediaId]);

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/movie/showtimes/${mediaId}/`);
      const data = Array.isArray(res.data) ? res.data : [];
      setShowtimes(data);

      if (data.length > 0) {
        setSelectedShowing(String(data[0].showing_id));
      }
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedShowing || seats < 1) {
      alert('Please select a showtime and number of seats');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/api/booking/`, {
        user_id: user.user_id,
        showing_id: parseInt(selectedShowing),
        seats_booked: parseInt(seats),
      });

      alert('Booking confirmed!');
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedShow = showtimes.find(s => String(s.showing_id) === String(selectedShowing));
  const totalPrice = selectedShow ? parseFloat(selectedShow.price) * seats : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="bm-overlay" onClick={onClose}>
        <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
          <button className="bm-close" onClick={onClose}>×</button>

          <div className="bm-header">
            <h2 className="bm-title">Book Tickets</h2>
            <p className="bm-subtitle">{mediaTitle}</p>
          </div>

          <div className="bm-body">
            {loading ? (
              <div className="bm-loading">Loading showtimes...</div>
            ) : showtimes.length === 0 ? (
              <div className="bm-empty">
                No showtimes available for this movie.
              </div>
            ) : (
              <>
                <div className="bm-field">
                  <label className="bm-label">Select Showtime</label>
                  <select
                    className="bm-select"
                    value={selectedShowing}
                    onChange={(e) => setSelectedShowing(e.target.value)}
                  >
                    {showtimes.map((showing) => (
                      <option key={showing.showing_id} value={showing.showing_id}>
                        {showing.show_date} at {showing.show_time.slice(0, 5)} -
                        {' '}{showing.cinema_name} ({showing.screen_name}) -
                        {' '}₹{showing.price} - {showing.available_seats} seats left
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bm-field">
                  <label className="bm-label">Number of Seats</label>
                  <input
                    type="number"
                    className="bm-input"
                    min="1"
                    max={selectedShow?.available_seats || 10}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                {selectedShow && (
                  <div className="bm-info">
                    <div className="bm-info-row">
                      <span className="bm-info-label">Cinema</span>
                      <span className="bm-info-value">{selectedShow.cinema_name}</span>
                    </div>
                    <div className="bm-info-row">
                      <span className="bm-info-label">Screen</span>
                      <span className="bm-info-value">{selectedShow.screen_name} ({selectedShow.screen_type})</span>
                    </div>
                    <div className="bm-info-row">
                      <span className="bm-info-label">Location</span>
                      <span className="bm-info-value">{selectedShow.cinema_location}</span>
                    </div>
                    <div className="bm-info-row">
                      <span className="bm-info-label">Price per seat</span>
                      <span className="bm-info-value">₹{selectedShow.price}</span>
                    </div>
                    <div className="bm-info-row">
                      <span className="bm-info-label">Total</span>
                      <span className="bm-info-value">₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="bm-actions">
                  <button
                    className="bm-btn bm-btn-cancel"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="bm-btn bm-btn-confirm"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}