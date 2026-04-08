import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './Authcontext';

const API = 'http://127.0.0.1:8000';

const styles = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-content {
    background: #fff;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }

  .modal-header {
    padding: 24px 28px;
    border-bottom: 1px solid #e4e0d8;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px;
    font-weight: 400;
    color: #111;
  }

  .modal-close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f5f3ef;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #666;
    transition: all 0.2s;
  }

  .modal-close:hover {
    background: #e4e0d8;
    color: #111;
  }

  .modal-body {
    padding: 28px;
  }

  .booking-section {
    margin-bottom: 24px;
  }

  .booking-label {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
  }

  .showtime-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px;
  }

  .showtime-card {
    padding: 16px;
    background: #faf9f7;
    border: 2px solid #e4e0d8;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .showtime-card:hover {
    background: #f5f3ef;
    border-color: #d4d0c8;
  }

  .showtime-card.selected {
    background: #f0f9f4;
    border-color: #1a6b3c;
  }

  .showtime-cinema {
    font-weight: 600;
    font-size: 16px;
    color: #111;
    margin-bottom: 6px;
  }

  .showtime-location {
    font-size: 13px;
    color: #888;
    margin-bottom: 8px;
  }

  .showtime-details {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 14px;
    color: #555;
  }

  .showtime-time {
    font-weight: 600;
    color: #111;
  }

  .showtime-price {
    color: #1a6b3c;
    font-weight: 600;
  }

  .showtime-seats {
    color: #888;
  }

  .seats-selector {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #faf9f7;
    border-radius: 10px;
  }

  .seats-label {
    font-size: 14px;
    font-weight: 500;
    color: #555;
  }

  .seats-input {
    width: 80px;
    padding: 10px;
    border: 1.5px solid #d4d0c8;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
  }

  .seats-input:focus {
    border-color: #111;
  }

  .booking-summary {
    background: linear-gradient(135deg, #f5f3ef 0%, #e8e6e1 100%);
    border: 1.5px solid #d4d0c8;
    border-radius: 10px;
    padding: 20px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 15px;
  }

  .summary-label {
    color: #666;
  }

  .summary-value {
    font-weight: 600;
    color: #111;
  }

  .summary-total {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1.5px solid #c4c0b8;
  }

  .summary-total .summary-label {
    font-weight: 600;
    color: #111;
    font-size: 16px;
  }

  .summary-total .summary-value {
    font-size: 20px;
    color: #1a6b3c;
  }

  .modal-footer {
    padding: 20px 28px;
    border-top: 1px solid #e4e0d8;
    display: flex;
    gap: 12px;
  }

  .btn-modal {
    flex: 1;
    padding: 14px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-modal:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  .btn-modal:active {
    transform: translateY(0);
  }

  .btn-cancel {
    background: #f5f3ef;
    color: #666;
    border: 1.5px solid #d4d0c8;
  }

  .btn-cancel:hover {
    background: #e4e0d8;
    color: #111;
  }

  .btn-confirm {
    background: #1a6b3c;
    color: #fff;
  }

  .btn-confirm:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  .booking-success {
    text-align: center;
    padding: 40px 20px;
  }

  .success-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .success-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #1a6b3c;
    margin-bottom: 12px;
  }

  .success-message {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
  }

  .booking-empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  @media (max-width: 640px) {
    .modal-content {
      border-radius: 12px;
    }
    .modal-header {
      padding: 20px;
    }
    .modal-body {
      padding: 20px;
    }
    .modal-footer {
      padding: 16px 20px;
      flex-direction: column;
    }
  }
`;

function BookingModal({ showtimes, mediaId, mediaTitle, onClose }) {
  const { user } = useAuth();
  const [selectedShowing, setSelectedShowing] = useState(null);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleBooking = async () => {
    if (!selectedShowing || !user?.user_id) return;

    setBooking(true);
    try {
      await axios.post(`${API}/api/booking/`, {
        user_id: user.user_id,
        showing_id: selectedShowing.showing_id,
        seats_booked: seats,
      });

      setBookingComplete(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  const handleClose = () => {
    if (bookingComplete) {
      onClose();
    } else {
      onClose();
    }
  };

  const totalPrice = selectedShowing ? selectedShowing.price * seats : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              {bookingComplete ? 'Booking Confirmed' : 'Book Tickets'}
            </h2>
            <button className="modal-close" onClick={handleClose}>
              ×
            </button>
          </div>

          <div className="modal-body">
            {bookingComplete ? (
              <div className="booking-success">
                <div className="success-icon">🎉</div>
                <h3 className="success-title">Booking Successful!</h3>
                <p className="success-message">
                  Your tickets for <strong>{mediaTitle}</strong> have been
                  booked. You'll receive a confirmation email shortly.
                </p>
              </div>
            ) : showtimes.length > 0 ? (
              <>
                <div className="booking-section">
                  <div className="booking-label">Select Showtime</div>
                  <div className="showtime-list">
                    {showtimes.map((showing) => (
                      <div
                        key={showing.showing_id}
                        className={`showtime-card ${
                          selectedShowing?.showing_id === showing.showing_id
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() => setSelectedShowing(showing)}
                      >
                        <div className="showtime-cinema">
                          {showing.cinema_name}
                        </div>
                        <div className="showtime-location">
                          {showing.cinema_location}
                        </div>
                        <div className="showtime-details">
                          <span className="showtime-time">
                            {showing.show_date} at{' '}
                            {showing.show_time?.slice(0, 5)}
                          </span>
                          <span>•</span>
                          <span className="showtime-price">
                            ₹{showing.price}
                          </span>
                          <span>•</span>
                          <span className="showtime-seats">
                            {showing.available_seats} seats left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedShowing && (
                  <>
                    <div className="booking-section">
                      <div className="booking-label">Number of Seats</div>
                      <div className="seats-selector">
                        <span className="seats-label">Seats:</span>
                        <input
                          type="number"
                          min="1"
                          max={selectedShowing.available_seats}
                          value={seats}
                          onChange={(e) => setSeats(Number(e.target.value))}
                          className="seats-input"
                        />
                        <span className="seats-label">
                          (Max: {selectedShowing.available_seats})
                        </span>
                      </div>
                    </div>

                    <div className="booking-section">
                      <div className="booking-label">Booking Summary</div>
                      <div className="booking-summary">
                        <div className="summary-row">
                          <span className="summary-label">Cinema:</span>
                          <span className="summary-value">
                            {selectedShowing.cinema_name}
                          </span>
                        </div>
                        <div className="summary-row">
                          <span className="summary-label">Date & Time:</span>
                          <span className="summary-value">
                            {selectedShowing.show_date} at{' '}
                            {selectedShowing.show_time?.slice(0, 5)}
                          </span>
                        </div>
                        <div className="summary-row">
                          <span className="summary-label">Seats:</span>
                          <span className="summary-value">{seats}</span>
                        </div>
                        <div className="summary-row">
                          <span className="summary-label">Price per seat:</span>
                          <span className="summary-value">
                            ₹{selectedShowing.price}
                          </span>
                        </div>
                        <div className="summary-row summary-total">
                          <span className="summary-label">Total:</span>
                          <span className="summary-value">
                            ₹{totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="booking-empty">
                <div className="empty-icon">🎬</div>
                <p>No showtimes available for this movie.</p>
              </div>
            )}
          </div>

          {!bookingComplete && showtimes.length > 0 && (
            <div className="modal-footer">
              <button className="btn-modal btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="btn-modal btn-confirm"
                onClick={handleBooking}
                disabled={!selectedShowing || booking}
              >
                {booking ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BookingModal;