import { useState } from 'react';

const WatchlistButton = ({ showId, isInWatchlist = false, userCount = 394 }) => {
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [count, setCount] = useState(userCount);

  const handleAddToWatchlist = () => {
    setInWatchlist(!inWatchlist);
    if (!inWatchlist) {
      setCount(count + 1);
    } else {
      setCount(count - 1);
    }
  };

  return (
    <div className="watchlist-container">
      <button
        className={`watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`}
        onClick={handleAddToWatchlist}
      >
        <span className="watchlist-plus">+</span>
        <div className="watchlist-text">
          <div className="watchlist-main">
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </div>
          <div className="watchlist-subtitle">
            Added by {(count / 1000).toFixed(0)}K users
          </div>
        </div>
      </button>

      <button
        className="watchlist-dropdown"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Watchlist options"
      >
        ▼
      </button>

      {dropdownOpen && (
        <div className="watchlist-menu">
          <button className="menu-item">
            <span className="menu-icon">👁️</span>
            Mark as watched
          </button>
          <button className="menu-item">
            <span className="menu-icon">⭐</span>
            Rate this show
          </button>
          <button className="menu-item">
            <span className="menu-icon">📝</span>
            Add a review
          </button>
        </div>
      )}

      <style>{`
        .watchlist-container {
          position: relative;
          width: 100%;
          max-width: 480px;
        }

        .watchlist-btn {
          width: 100%;
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          border: none;
          border-radius: 32px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
          border-right: 2px solid rgba(0, 0, 0, 0.1);
        }

        .watchlist-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
        }

        .watchlist-btn:active {
          transform: translateY(0);
        }

        .watchlist-btn.in-watchlist {
          background: linear-gradient(135deg, #e6c200 0%, #ffd700 100%);
        }

        .watchlist-plus {
          font-size: 28px;
          font-weight: 300;
          line-height: 1;
          min-width: 24px;
        }

        .watchlist-text {
          text-align: left;
          flex: 1;
        }

        .watchlist-main {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.2;
        }

        .watchlist-subtitle {
          font-size: 12px;
          font-weight: 400;
          color: rgba(26, 26, 26, 0.7);
          margin-top: 2px;
        }

        .watchlist-dropdown {
          position: absolute;
          right: 0;
          top: 0;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          border: none;
          border-radius: 0 32px 32px 0;
          border-left: 2px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #1a1a1a;
          transition: all 0.3s ease;
        }

        .watchlist-dropdown:hover {
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
          transform: translateY(-2px);
        }

        .watchlist-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          margin-top: 8px;
          z-index: 1000;
          min-width: 200px;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-item {
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background 0.2s ease;
        }

        .menu-item:first-child {
          border-bottom: 1px solid #e5e5e5;
        }

        .menu-item:nth-child(2) {
          border-bottom: 1px solid #e5e5e5;
        }

        .menu-item:hover {
          background: #f9f9f9;
        }

        .menu-icon {
          display: inline-block;
          width: 20px;
          text-align: center;
        }

        @media (max-width: 640px) {
          .watchlist-btn {
            padding: 12px 16px;
            font-size: 14px;
          }

          .watchlist-plus {
            font-size: 24px;
          }

          .watchlist-text {
            display: none;
          }

          .watchlist-main,
          .watchlist-subtitle {
            display: none;
          }

          .watchlist-dropdown {
            width: 100%;
            border-radius: 32px;
            border: none;
          }

          .watchlist-menu {
            right: auto;
            left: 0;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default WatchlistButton;
