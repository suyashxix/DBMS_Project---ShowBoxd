import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AllReviews.css';

const AllReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');
  const [media, setMedia] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMediaAndReviews();
  }, [id, sortBy, filterRating, page]);

  const fetchMediaAndReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch media details
      const mediaRes = await axios.get(`http://127.0.0.1:8000/api/media/${id}/`);
      setMedia(mediaRes.data);

      // Fetch reviews with sorting
      let url = `http://127.0.0.1:8000/api/media/${id}/reviews/?page=${page}`;

      if (sortBy === 'highest') {
        url += '&ordering=-rating';
      } else if (sortBy === 'lowest') {
        url += '&ordering=rating';
      } else {
        url += '&ordering=-created_at';
      }

      if (filterRating !== 'all') {
        url += `&rating__gte=${filterRating}`;
      }

      const reviewsRes = await axios.get(url);

      if (page === 1) {
        setReviews(reviewsRes.data.results || []);
      } else {
        setReviews(prev => [...prev, ...(reviewsRes.data.results || [])]);
      }

      setHasMore(!!reviewsRes.data.next);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="all-reviews-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Details
      </button>

      {media && (
        <div className="reviews-header">
          <div className="media-info-compact">
            <img src={media.poster_url} alt={media.title} />
            <div>
              <h1>{media.title}</h1>
              <p>{media.year || media.release_date}</p>
              <div className="avg-rating">
                <div className="stars">
                  {renderStars(media.average_rating || 0)}
                </div>
                <span>{(media.average_rating || 0).toFixed(1)}/5</span>
              </div>
            </div>
          </div>

          <div className="filters">
            <div className="filter-group">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="rating">Filter by rating:</label>
              <select
                id="rating"
                value={filterRating}
                onChange={(e) => {
                  setFilterRating(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="reviews-list">
        {loading && page === 1 ? (
          <div className="loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">No reviews found.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <h3>{review.user?.username || 'Anonymous'}</h3>
                  <div className="stars">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.title && <h4>{review.title}</h4>}
              <p className="review-text">{review.comment}</p>
              <div className="review-footer">
                <span className="helpful">
                  {review.helpful_count || 0} found this helpful
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && !loading && (
        <button className="load-more-btn" onClick={handleLoadMore}>
          Load More Reviews
        </button>
      )}
    </div>
  );
};

export default AllReviews;