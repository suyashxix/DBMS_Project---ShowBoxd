import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './Authcontext';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');

  .tv-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .tv-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    color: #1a1a1a;
  }

  /* Hero Section - Same as Movie */
  .tv-hero {
    background: linear-gradient(to bottom, #1a1a1a 0%, #2a2a2a 100%);
    color: #fff;
    padding: 32px 0 48px;
  }
  .tv-hero-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    gap: 40px;
  }
  .tv-poster {
    width: 280px;
    min-width: 280px;
    height: 420px;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .tv-hero-info { flex: 1; padding-top: 8px; }
  .tv-title-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 12px;
  }
  .tv-title {
    font-family: 'DM Serif Display', serif;
    font-size: 42px;
    font-weight: 400;
    line-height: 1.15;
    color: #fff;
    flex: 1;
  }
  .tv-year {
    font-size: 28px;
    color: rgba(255,255,255,0.6);
    font-weight: 300;
  }

  .tv-meta-line {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    font-size: 15px;
    color: rgba(255,255,255,0.75);
  }
  .tv-meta-sep {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
  }

  .tv-rating-row {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 24px;
  }
  .tv-rating-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tv-rating-star {
    font-size: 24px;
    color: #f5c518;
  }
  .tv-rating-value {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
  }
  .tv-rating-out {
    font-size: 18px;
    color: rgba(255,255,255,0.5);
    font-weight: 400;
  }
  .tv-rating-count {
    font-size: 14px;
    color: rgba(255,255,255,0.6);
  }

  .tv-genres {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .tv-genre-tag {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    color: #fff;
    font-weight: 500;
  }

  .tv-desc {
    font-size: 16px;
    line-height: 1.7;
    color: rgba(255,255,255,0.85);
    margin-bottom: 28px;
    max-width: 700px;
  }

  .tv-action-btns {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .tv-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-family: 'DM Sans', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .tv-btn:hover { transform: translateY(-1px); opacity: 0.9; }
  .tv-btn-watchlist {
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.4);
    color: #fff;
  }
  .tv-btn-watchlist.active {
    background: rgba(26, 107, 60, 0.3);
    border-color: #1a6b3c;
  }

  /* Main Content */
  .tv-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 40px 60px;
  }

  .tv-section {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 12px;
    padding: 28px;
    margin-bottom: 24px;
  }
  .tv-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    font-weight: 400;
    color: #111;
    margin-bottom: 20px;
  }

  /* Season Selector */
  .tv-season-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .tv-season-btn {
    padding: 10px 20px;
    background: #f5f3ef;
    border: 1.5px solid #d4d0c8;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
  }
  .tv-season-btn:hover {
    border-color: #111;
    color: #111;
  }
  .tv-season-btn.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }

  /* Episode List */
  .tv-episodes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .tv-episode-card {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #faf9f7;
    border: 1px solid #e4e0d8;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .tv-episode-card:hover {
    background: #f5f3ef;
    border-color: #c4c0b8;
  }
  .tv-episode-num {
    font-size: 20px;
    font-weight: 700;
    color: #999;
    min-width: 40px;
  }
  .tv-episode-info {
    flex: 1;
  }
  .tv-episode-title {
    font-size: 16px;
    font-weight: 600;
    color: #111;
    margin-bottom: 6px;
  }
  .tv-episode-meta {
    font-size: 13px;
    color: #888;
    margin-bottom: 8px;
  }
  .tv-episode-desc {
    font-size: 14px;
    line-height: 1.6;
    color: #555;
  }

  /* Cast Section */
  .tv-cast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
  }
  .tv-cast-card {
    text-align: center;
  }
  .tv-cast-img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 8px;
    background: #e4e0d8;
    margin-bottom: 8px;
  }
  .tv-cast-name {
    font-size: 14px;
    font-weight: 600;
    color: #111;
    margin-bottom: 4px;
  }
  .tv-cast-role {
    font-size: 13px;
    color: #666;
  }

  /* Reviews */
  .tv-review-form {
    background: #faf9f7;
    border: 1px solid #e4e0d8;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 28px;
  }
  .tv-review-input-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }
  .tv-input {
    padding: 12px 16px;
    border: 1px solid #d4d0c8;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
  }
  .tv-input:focus { border-color: #111; }
  .tv-input.rating { width: 100px; text-align: center; }
  .tv-input.text { flex: 1; }
  .tv-submit-btn {
    width: 100%;
    padding: 12px;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .tv-submit-btn:hover { opacity: 0.85; }
  .tv-submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .tv-reviews-list { display: flex; flex-direction: column; gap: 16px; }
  .tv-review-card {
    background: #faf9f7;
    border: 1px solid #e4e0d8;
    border-radius: 10px;
    padding: 18px 20px;
  }
  .tv-review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .tv-review-author {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tv-review-name {
    font-weight: 600;
    font-size: 15px;
    color: #111;
  }
  .tv-review-verified {
    background: #d4f4dd;
    color: #1a6b3c;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
  .tv-review-rating {
    background: #111;
    color: #f5c518;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 600;
  }
  .tv-review-date {
    font-size: 13px;
    color: #999;
    margin-bottom: 10px;
  }
  .tv-review-text {
    font-size: 15px;
    line-height: 1.65;
    color: #444;
  }
  .tv-review-likes {
    margin-top: 12px;
    font-size: 13px;
    color: #888;
  }

  /* Similar Shows */
  .tv-similar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
  }
  .tv-similar-card {
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
  }
  .tv-similar-card:hover { transform: translateY(-4px); }
  .tv-similar-poster {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 8px;
    background: #e4e0d8;
    margin-bottom: 8px;
  }
  .tv-similar-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    margin-bottom: 4px;
  }
  .tv-similar-rating {
    font-size: 13px;
    color: #666;
  }

  .tv-empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }
  .tv-empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .tv-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    font-size: 16px;
    color: #888;
  }

  .tv-signin-prompt {
    background: #fff7e6;
    border: 1px solid #f5c518;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
  }
  .tv-signin-prompt p {
    margin-bottom: 16px;
    color: #666;
  }
  .tv-signin-link {
    display: inline-block;
    padding: 10px 24px;
    background: #111;
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  /* Watchlist Dropdown */
  .tv-watchlist-dropdown {
    position: relative;
    display: inline-block;
  }
  .tv-watchlist-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    min-width: 200px;
    padding: 8px;
    z-index: 100;
  }
  .tv-watchlist-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
    font-size: 14px;
    color: #333;
  }
  .tv-watchlist-option:hover {
    background: #f5f3ef;
  }
  .tv-watchlist-check {
    color: #1a6b3c;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .tv-hero-content { flex-direction: column; padding: 0 24px; }
    .tv-poster { width: 100%; max-width: 280px; margin: 0 auto; }
    .tv-title { font-size: 32px; }
    .tv-main { padding: 24px 20px; }
    .tv-cast-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
  }
`;

function TVShowDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [similarMedia, setSimilarMedia] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(8);
  const [submitting, setSubmitting] = useState(false);
  const [showWatchlistMenu, setShowWatchlistMenu] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState({
    private: false,
    public: false,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (user?.user_id) {
      fetchWatchlistStatus();
    }
  }, [user, id]);

  useEffect(() => {
    if (selectedSeason) {
      fetchEpisodes(selectedSeason);
    }
  }, [selectedSeason]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [detailsRes, seasonsRes, similarRes] = await Promise.all([
        axios.get(`${API}/api/media/${id}/`),
        axios.get(`${API}/api/tvshow/${id}/seasons/`),
        axios.get(`${API}/api/media/${id}/similar/`).catch(() => ({ data: [] })),
      ]);

      setData(detailsRes.data);
      setSeasons(seasonsRes.data);
      setSimilarMedia(similarRes.data);

      // Auto-select first season
      if (seasonsRes.data.length > 0) {
        setSelectedSeason(seasonsRes.data[0].season_id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async (seasonId) => {
    try {
      const response = await axios.get(`${API}/api/season/${seasonId}/`);
      setEpisodes(response.data.episodes || []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      setEpisodes([]);
    }
  };

  const fetchWatchlistStatus = async () => {
    if (!user?.user_id) return;

    try {
      const [privateRes, publicRes] = await Promise.all([
        axios.get(`${API}/api/watchlist/${user.user_id}/private/`),
        axios.get(`${API}/api/watchlist/${user.user_id}/public/`),
      ]);

      setWatchlistStatus({
        private: privateRes.data.some((item) => item.media_id === Number(id)),
        public: publicRes.data.some((item) => item.media_id === Number(id)),
      });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const toggleWatchlist = async (visibility) => {
    if (!user?.user_id) return;

    try {
      await axios.post(`${API}/api/watchlist/toggle/`, {
        user_id: user.user_id,
        media_id: id,
        visibility,
      });

      setWatchlistStatus((prev) => ({
        ...prev,
        [visibility]: !prev[visibility],
      }));
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user?.user_id) return;

    setSubmitting(true);
    try {
      await axios.post(`${API}/api/review/`, {
        user_id: user.user_id,
        media_id: id,
        rating,
        review_text: reviewText,
      });

      setReviewText('');
      setRating(8);
      fetchData();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="tv-wrap">
          <div className="tv-loading">Loading...</div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <style>{styles}</style>
        <div className="tv-wrap">
          <div className="tv-empty">
            <div className="tv-empty-icon">📺</div>
            <p>TV Show not found</p>
          </div>
        </div>
      </>
    );
  }

  const { details, extra, cast, reviews } = data;
  const genres = details.genres || [];

  return (
    <>
      <style>{styles}</style>
      <div className="tv-wrap">
        {/* Hero Section */}
        <div className="tv-hero">
          <div className="tv-hero-content">
            <img
              src={details.poster_url || '/placeholder-poster.png'}
              alt={details.title}
              className="tv-poster"
            />
            <div className="tv-hero-info">
              <div className="tv-title-row">
                <h1 className="tv-title">{details.title}</h1>
                {details.release_date && (
                  <span className="tv-year">
                    ({new Date(details.release_date).getFullYear()})
                  </span>
                )}
              </div>

              <div className="tv-meta-line">
                {extra?.total_seasons && (
                  <>
                    <span>{extra.total_seasons} Season{extra.total_seasons > 1 ? 's' : ''}</span>
                    <span className="tv-meta-sep" />
                  </>
                )}
                {extra?.status && (
                  <>
                    <span>{extra.status}</span>
                    <span className="tv-meta-sep" />
                  </>
                )}
                {details.language && <span>{details.language}</span>}
              </div>

              <div className="tv-rating-row">
                <div className="tv-rating-box">
                  <span className="tv-rating-star">★</span>
                  <span className="tv-rating-value">
                    {details.aggregate_rating
                      ? Number(details.aggregate_rating).toFixed(1)
                      : 'N/A'}
                  </span>
                  <span className="tv-rating-out">/10</span>
                </div>
                {details.total_reviews > 0 && (
                  <span className="tv-rating-count">
                    ({details.total_reviews.toLocaleString()} reviews)
                  </span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="tv-genres">
                  {genres.map((genre) => (
                    <span key={genre.genre_id} className="tv-genre-tag">
                      {genre.genre_name}
                    </span>
                  ))}
                </div>
              )}

              {details.description && (
                <p className="tv-desc">{details.description}</p>
              )}

              <div className="tv-action-btns">
                {user ? (
                  <div className="tv-watchlist-dropdown">
                    <button
                      className={`tv-btn tv-btn-watchlist ${
                        watchlistStatus.private || watchlistStatus.public ? 'active' : ''
                      }`}
                      onClick={() => setShowWatchlistMenu(!showWatchlistMenu)}
                    >
                      {watchlistStatus.private || watchlistStatus.public ? '✓' : '+'} Watchlist
                    </button>
                    {showWatchlistMenu && (
                      <div className="tv-watchlist-menu">
                        <div
                          className="tv-watchlist-option"
                          onClick={() => {
                            toggleWatchlist('private');
                            setShowWatchlistMenu(false);
                          }}
                        >
                          <span>Private Watchlist</span>
                          {watchlistStatus.private && (
                            <span className="tv-watchlist-check">✓</span>
                          )}
                        </div>
                        <div
                          className="tv-watchlist-option"
                          onClick={() => {
                            toggleWatchlist('public');
                            setShowWatchlistMenu(false);
                          }}
                        >
                          <span>Public Watchlist</span>
                          {watchlistStatus.public && (
                            <span className="tv-watchlist-check">✓</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="tv-btn tv-btn-watchlist">
                    Sign in to add to Watchlist
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="tv-main">
          {/* Seasons & Episodes */}
          {seasons.length > 0 && (
            <div className="tv-section">
              <h2 className="tv-section-title">Episodes</h2>

              <div className="tv-season-selector">
                {seasons.map((season) => (
                  <button
                    key={season.season_id}
                    className={`tv-season-btn ${
                      selectedSeason === season.season_id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedSeason(season.season_id)}
                  >
                    Season {season.season_number}
                  </button>
                ))}
              </div>

              {episodes.length > 0 ? (
                <div className="tv-episodes-list">
                  {episodes.map((episode) => (
                    <div key={episode.episode_id} className="tv-episode-card">
                      <div className="tv-episode-num">
                        {episode.episode_number}
                      </div>
                      <div className="tv-episode-info">
                        <div className="tv-episode-title">{episode.title}</div>
                        <div className="tv-episode-meta">
                          {episode.air_date && formatDate(episode.air_date)}
                          {episode.duration_minutes && (
                            <> • {episode.duration_minutes} min</>
                          )}
                        </div>
                        {episode.description && (
                          <div className="tv-episode-desc">{episode.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tv-empty">
                  <div className="tv-empty-icon">🎬</div>
                  <p>No episodes available for this season</p>
                </div>
              )}
            </div>
          )}

          {/* Cast & Crew */}
          {cast && cast.length > 0 && (
            <div className="tv-section">
              <h2 className="tv-section-title">Cast & Crew</h2>
              <div className="tv-cast-grid">
                {cast.slice(0, 8).map((member) => (
                  <div key={member.cast_crew_id} className="tv-cast-card">
                    <div className="tv-cast-img" />
                    <div className="tv-cast-name">{member.person.name}</div>
                    <div className="tv-cast-role">{member.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="tv-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="tv-section-title">
                User Reviews ({reviews?.length || 0})
              </h2>
              {reviews && reviews.length > 4 && (
                <Link to={`/media/${id}/reviews`} style={{ color: '#d4a853', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>
                  View All Reviews →
                </Link>
              )}
            </div>

            {user ? (
              <form onSubmit={submitReview} className="tv-review-form">
                <div className="tv-review-input-row">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="tv-input rating"
                    placeholder="Rating"
                  />
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="tv-input text"
                    placeholder="Write your review..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="tv-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="tv-signin-prompt">
                <p>Sign in to write a review</p>
                <Link to="/login" className="tv-signin-link">
                  Sign In
                </Link>
              </div>
            )}

            {reviews && reviews.length > 0 ? (
              <div className="tv-reviews-list">
                {reviews.slice(0, 4).map((review) => (
                  <div key={review.review_id} className="tv-review-card">
                    <div className="tv-review-header">
                      <div className="tv-review-author">
                        <span className="tv-review-name">
                          {review.name || 'Anonymous'}
                        </span>
                        {review.is_verified && (
                          <span className="tv-review-verified">Verified</span>
                        )}
                      </div>
                      <span className="tv-review-rating">★ {review.rating}</span>
                    </div>
                    <div className="tv-review-date">
                      {formatDate(review.review_date)}
                    </div>
                    {review.review_text && (
                      <p className="tv-review-text">{review.review_text}</p>
                    )}
                    {review.like_count > 0 && (
                      <div className="tv-review-likes">
                        {review.like_count} people found this helpful
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="tv-empty">
                <div className="tv-empty-icon">📝</div>
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>

          {/* Similar Shows */}
          {similarMedia && similarMedia.length > 0 && (
            <div className="tv-section">
              <h2 className="tv-section-title">More Like This</h2>
              <div className="tv-similar-grid">
                {similarMedia.map((item) => (
                  <Link
                    key={item.media_id}
                    to={`/media/${item.media_id}`}
                    className="tv-similar-card"
                  >
                    <img
                      src={item.poster_url || '/placeholder-poster.png'}
                      alt={item.title}
                      className="tv-similar-poster"
                    />
                    <div className="tv-similar-title">{item.title}</div>
                    <div className="tv-similar-rating">
                      ★{' '}
                      {item.aggregate_rating
                        ? Number(item.aggregate_rating).toFixed(1)
                        : 'N/A'}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TVShowDetail;