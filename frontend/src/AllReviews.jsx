import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

  .ar-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .ar-wrap {
    font-family: 'Roboto', sans-serif;
    background: #000;
    color: #fff;
    min-height: 100vh;
    padding: 48px;
  }

  .ar-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .ar-header {
    margin-bottom: 32px;
  }

  .ar-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #5799ef;
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .ar-back:hover {
    text-decoration: underline;
  }

  .ar-title {
    font-size: 32px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .ar-subtitle {
    font-size: 16px;
    color: #999;
  }

  .ar-filters {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  .ar-filter-label {
    font-size: 14px;
    color: #999;
    display: flex;
    align-items: center;
  }

  .ar-filter-select {
    padding: 8px 16px;
    background: #1a1a1a;
    border: 1px solid #444;
    border-radius: 4px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }

  .ar-filter-select:focus {
    outline: none;
    border-color: #f5c518;
  }

  .ar-reviews {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ar-review-card {
    background: #1a1a1a;
    border-radius: 8px;
    padding: 24px;
    border-left: 3px solid #f5c518;
  }

  .ar-review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .ar-review-author {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ar-review-name {
    font-weight: 500;
    color: #5799ef;
    font-size: 16px;
  }

  .ar-verified-badge {
    background: #1a6b3c;
    color: #fff;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  .ar-review-rating {
    background: #f5c518;
    color: #000;
    padding: 6px 14px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 16px;
  }

  .ar-review-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #999;
    margin-bottom: 16px;
  }

  .ar-review-date {
    color: #999;
  }

  .ar-review-helpful {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ar-review-text {
    color: #ddd;
    line-height: 1.8;
    font-size: 15px;
  }

  .ar-review-actions {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #2a2a2a;
  }

  .ar-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #999;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s;
  }

  .ar-action-btn:hover {
    color: #fff;
  }

  .ar-action-btn.active {
    color: #f5c518;
  }

  .ar-empty {
    text-align: center;
    padding: 80px 20px;
    color: #666;
  }

  .ar-empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .ar-empty-title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .ar-empty-desc {
    font-size: 14px;
    color: #888;
  }

  .ar-loading {
    text-align: center;
    padding: 80px 20px;
    color: #999;
  }

  @media (max-width: 768px) {
    .ar-wrap { padding: 24px 16px; }
    .ar-title { font-size: 24px; }
  }
`;

export default function AllReviews() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [mediaTitle, setMediaTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent'); // recent, rating-high, rating-low, helpful
  const [filterRating, setFilterRating] = useState('all'); // all, 1-10

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/media/${id}/`);
      setMediaTitle(res.data.details.title);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      if (filterRating === 'all') return true;
      return review.rating == filterRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.review_date) - new Date(a.review_date);
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'helpful':
          return (b.helpful_count || 0) - (a.helpful_count || 0);
        default:
          return 0;
      }
    });

  return (
    <>
      <style>{styles}</style>
      <div className="ar-wrap">
        <div className="ar-container">
          <div className="ar-header">
            <a className="ar-back" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
              ← Back
            </a>
            <h1 className="ar-title">User Reviews</h1>
            <p className="ar-subtitle">{mediaTitle}</p>
          </div>

          <div className="ar-filters">
            <span className="ar-filter-label">Sort by:</span>
            <select
              className="ar-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="rating-high">Rating: High to Low</option>
              <option value="rating-low">Rating: Low to High</option>
              <option value="helpful">Most Helpful</option>
            </select>

            <span className="ar-filter-label" style={{ marginLeft: '16px' }}>Filter:</span>
            <select
              className="ar-filter-select"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="10">⭐ 10/10</option>
              <option value="9">⭐ 9/10</option>
              <option value="8">⭐ 8/10</option>
              <option value="7">⭐ 7/10</option>
              <option value="6">⭐ 6/10</option>
              <option value="5">⭐ 5/10 and below</option>
            </select>
          </div>

          {loading ? (
            <div className="ar-loading">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="ar-empty">
              <div className="ar-empty-icon">💭</div>
              <div className="ar-empty-title">No reviews yet</div>
              <p className="ar-empty-desc">
                {filterRating !== 'all' || sortBy !== 'recent'
                  ? 'Try adjusting your filters'
                  : 'Be the first to share your thoughts'}
              </p>
            </div>
          ) : (
            <div className="ar-reviews">
              {filteredReviews.map(review => (
                <div key={review.review_id} className="ar-review-card">
                  <div className="ar-review-header">
                    <div className="ar-review-author">
                      <span className="ar-review-name">{review.name || 'Anonymous'}</span>
                      {review.is_verified && (
                        <span className="ar-verified-badge">✓ Verified</span>
                      )}
                    </div>
                    <span className="ar-review-rating">{review.rating}/10</span>
                  </div>

                  <div className="ar-review-meta">
                    <span className="ar-review-date">{formatDate(review.review_date)}</span>
                    {review.helpful_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="ar-review-helpful">
                          👍 {review.helpful_count} found this helpful
                        </span>
                      </>
                    )}
                  </div>

                  {review.review_text && (
                    <p className="ar-review-text">{review.review_text}</p>
                  )}

                  <div className="ar-review-actions">
                    <button className="ar-action-btn">
                      👍 Helpful
                    </button>
                    <button className="ar-action-btn">
                      🔗 Share
                    </button>
                    <button className="ar-action-btn">
                      🚩 Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}