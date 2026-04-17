import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './Authcontext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');

  .hm-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .hm-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f8f6f2;
    min-height: 100vh;
    padding-bottom: 80px;
  }

  /* Hero Carousel */
  .hm-hero {
    position: relative;
    overflow: hidden;
    margin-bottom: 56px;
  }
  .hm-hero-track {
    display: flex;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hm-hero-slide {
    flex: 0 0 100%;
    position: relative;
    height: 520px;
  }
  .hm-hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hm-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      rgba(17,17,17,0.92) 0%,
      rgba(17,17,17,0.7) 40%,
      rgba(17,17,17,0.2) 70%,
      transparent 100%
    );
  }
  .hm-hero-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    max-width: 680px;
  }
  .hm-hero-tag {
    display: inline-flex;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1a6b3c;
    background: rgba(26,107,60,0.18);
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 18px;
    width: fit-content;
  }
  .hm-hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 56px;
    font-weight: 400;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .hm-hero-desc {
    font-size: 17px;
    color: rgba(255,255,255,0.88);
    line-height: 1.6;
    margin-bottom: 32px;
  }
  .hm-hero-actions {
    display: flex;
    gap: 14px;
  }
  .hm-hero-btn {
    padding: 14px 32px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.18s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .hm-hero-btn.primary {
    background: #1a6b3c;
    color: #fff;
  }
  .hm-hero-btn.primary:hover { background: #155a32; }
  .hm-hero-btn.secondary {
    background: rgba(255,255,255,0.15);
    color: #fff;
    backdrop-filter: blur(8px);
  }
  .hm-hero-btn.secondary:hover { background: rgba(255,255,255,0.25); }

  /* Navigation dots */
  .hm-hero-nav {
    position: absolute;
    bottom: 24px;
    left: 80px;
    display: flex;
    gap: 10px;
    z-index: 2;
  }
  .hm-hero-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    cursor: pointer;
    transition: all 0.2s;
  }
  .hm-hero-dot.active {
    width: 32px;
    border-radius: 5px;
    background: #fff;
  }

  /* Arrow buttons */
  .hm-hero-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.2s;
  }
  .hm-hero-arrow:hover { background: rgba(255,255,255,0.3); }
  .hm-hero-arrow.left { left: 24px; }
  .hm-hero-arrow.right { right: 24px; }

  /* Sections */
  .hm-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 48px;
  }
  .hm-section {
    margin-bottom: 56px;
  }
  .hm-section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .hm-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    font-weight: 400;
    color: #111;
  }
  .hm-section-link {
    font-size: 14px;
    font-weight: 500;
    color: #1a6b3c;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: gap 0.2s;
  }
  .hm-section-link:hover { gap: 8px; }

  /* Scroll Row */
  .hm-scroll-wrap {
    position: relative;
  }
  .hm-scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.95);
    border: 1px solid #e4e0d8;
    color: #111;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.2s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }
  .hm-scroll-btn:hover {
    background: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  }
  .hm-scroll-btn.left { left: -20px; }
  .hm-scroll-btn.right { right: -20px; }

  .hm-scroll-row {
    display: flex;
    gap: 18px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .hm-scroll-row::-webkit-scrollbar { display: none; }

  /* Card */
  .hm-card {
    flex: 0 0 200px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
  }
  .hm-card:hover { transform: translateY(-4px); }
  .hm-card-poster {
    width: 200px;
    height: 300px;
    border-radius: 10px;
    object-fit: cover;
    background: #e4e0d8;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  .hm-card-info {
    padding: 12px 4px 0;
  }
  .hm-card-title {
    font-size: 15px;
    font-weight: 500;
    color: #111;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .hm-card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hm-card-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #666;
  }
  .hm-card-type {
    font-size: 12px;
    color: #999;
    text-transform: uppercase;
  }

  .hm-loading {
    text-align: center;
    padding: 40px;
    color: #999;
  }

  @media (max-width: 768px) {
    .hm-container { padding: 0 24px; }
    .hm-hero-content { padding: 0 40px; max-width: 90%; }
    .hm-hero-title { font-size: 36px; }
    .hm-hero-nav, .hm-hero-arrow { display: none; }
  }
`;

const FEATURED_NEWS = [
  {
    id: 1,
    tag: 'Now Showing',
    title: 'Blockbuster Season is Here',
    desc: 'Book your tickets now for the most anticipated films of the year. Premium seats available at select theaters.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=900&fit=crop',
    link: '/now-showing',
    cta: 'Book Tickets',
  },
  {
    id: 2,
    tag: 'Critics Choice',
    title: 'Award Season Winners Announced',
    desc: 'See what films and performances are being celebrated this year. Read reviews from top critics and audiences.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&h=900&fit=crop',
    link: '/winners',
    cta: 'See Winners',
  },
  {
    id: 3,
    tag: 'Coming Soon',
    title: 'Most Anticipated Releases',
    desc: 'Get early access to tickets for upcoming blockbusters. Add them to your watchlist and never miss a premiere.',
    image: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=1600&h=900&fit=crop',
    link: '/coming-soon',
    cta: 'View Releases',
  },
  {
    id: 4,
    tag: 'Top Reviews',
    title: 'Community Picks This Month',
    desc: 'Discover what our community is loving. Read honest reviews and ratings from fellow movie enthusiasts.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&h=900&fit=crop',
    link: '/community',
    cta: 'Read Reviews',
  },
];

// Icons
const ChevronLeftIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// Scroll Row Component
function ScrollRow({ title, items, loading, linkTo }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -500 : 500,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="hm-section">
      <div className="hm-section-header">
        <h2 className="hm-section-title">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="hm-section-link">
            View all <ArrowRightIcon />
          </Link>
        )}
      </div>
      <div className="hm-scroll-wrap">
        <button className="hm-scroll-btn left" onClick={() => scroll('left')}>
          <ChevronLeftIcon />
        </button>
        <div className="hm-scroll-row" ref={scrollRef}>
          {loading ? (
            <div className="hm-loading">Loading...</div>
          ) : items.length === 0 ? (
            <div className="hm-loading">No items found</div>
          ) : (
            items.map((item) => (
              <Link to={`/media/${item.media_id}`} className="hm-card" key={item.media_id}>
                {item.poster_url ? (
                  <img src={item.poster_url} alt={item.title} className="hm-card-poster" />
                ) : (
                  <div className="hm-card-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                    🎬
                  </div>
                )}
                <div className="hm-card-info">
                  <div className="hm-card-title">{item.title}</div>
                  <div className="hm-card-meta">
                    {item.aggregate_rating && (
                      <div className="hm-card-rating">
                        <StarIcon /> {item.aggregate_rating}
                      </div>
                    )}
                    <span className="hm-card-type">
                      {item.media_type === 'tv_show' ? 'TV' : 'Film'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <button className="hm-scroll-btn right" onClick={() => scroll('right')}>
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // State for different content sections
  const [trending, setTrending] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [recommendedShows, setRecommendedShows] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);

  const [loading, setLoading] = useState({
    trending: true,
    recommendedMovies: true,
    recommendedShows: true,
    topRatedMovies: true,
  });

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_NEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Trending (uses /api/trending/)
  useEffect(() => {
    axios
      .get(`${API}/api/trending/`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setTrending(data.slice(0, 12));
      })
      .catch((err) => {
        console.error('Error fetching trending:', err);
        setTrending([]);
      })
      .finally(() => setLoading((prev) => ({ ...prev, trending: false })));
  }, []);

  // Fetch Personalized Recommendations (uses /api/user/{user_id}/recommendations/)
  useEffect(() => {
    if (!user) {
      setLoading((prev) => ({
        ...prev,
        recommendedMovies: false,
        recommendedShows: false
      }));
      return;
    }

    axios
      .get(`${API}/api/user/${user.user_id}/recommendations/`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        const movies = data.filter(item => item.media_type === 'movie').slice(0, 12);
        const shows = data.filter(item => item.media_type === 'tv_show').slice(0, 12);
        setRecommendedMovies(movies);
        setRecommendedShows(shows);
      })
      .catch((err) => {
        console.error('Error fetching recommendations:', err);
        setRecommendedMovies([]);
        setRecommendedShows([]);
      })
      .finally(() => setLoading((prev) => ({
        ...prev,
        recommendedMovies: false,
        recommendedShows: false
      })));
  }, [user]);

  // Fetch Top Rated Movies (uses /api/search/?top_rated=true&type=movie)
  useEffect(() => {
    axios
      .get(`${API}/api/search/`, { params: { top_rated: 'true', type: 'movie' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setTopRatedMovies(data.slice(0, 12));
      })
      .catch((err) => {
        console.error('Error fetching top rated:', err);
        setTopRatedMovies([]);
      })
      .finally(() => setLoading((prev) => ({ ...prev, topRatedMovies: false })));
  }, []);

  const goToSlide = (i) => setCurrentSlide(i);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + FEATURED_NEWS.length) % FEATURED_NEWS.length);
  const nextSlide = () => setCurrentSlide((p) => (p + 1) % FEATURED_NEWS.length);

  return (
    <>
      <style>{styles}</style>
      <div className="hm-wrap">
        {/* Hero Carousel */}
        <div className="hm-hero">
          <div
            className="hm-hero-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {FEATURED_NEWS.map((item) => (
              <div className="hm-hero-slide" key={item.id}>
                <img className="hm-hero-img" src={item.image} alt={item.title} />
                <div className="hm-hero-overlay" />
                <div className="hm-hero-content">
                  <span className="hm-hero-tag">{item.tag}</span>
                  <h1 className="hm-hero-title">{item.title}</h1>
                  <p className="hm-hero-desc">{item.desc}</p>
                  <div className="hm-hero-actions">
                    <Link to={item.link} className="hm-hero-btn primary">
                      {item.cta}
                    </Link>
                    <Link to="/watchlist" className="hm-hero-btn secondary">
                      Add to Watchlist
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="hm-hero-nav">
            {FEATURED_NEWS.map((_, i) => (
              <button
                key={i}
                className={`hm-hero-dot ${i === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <button className="hm-hero-arrow left" onClick={prevSlide}>
            <ChevronLeftIcon />
          </button>
          <button className="hm-hero-arrow right" onClick={nextSlide}>
            <ChevronRightIcon />
          </button>
        </div>

        {/* Content Sections */}
        <div className="hm-container">
          {/* Trending Now */}
          <ScrollRow
            title="Trending Now"
            items={trending}
            loading={loading.trending}
            linkTo="/trending"
          />

          {/* Recommended for You (only if user is logged in) */}
          {user && (
            <>
              {recommendedMovies.length > 0 && (
                <ScrollRow
                  title="Recommended Movies for You"
                  items={recommendedMovies}
                  loading={loading.recommendedMovies}
                />
              )}

              {recommendedShows.length > 0 && (
                <ScrollRow
                  title="Recommended TV Shows for You"
                  items={recommendedShows}
                  loading={loading.recommendedShows}
                />
              )}
            </>
          )}

          {/* Top Rated Movies */}
          <ScrollRow
            title="Top Rated Movies"
            items={topRatedMovies}
            loading={loading.topRatedMovies}
            linkTo="/home?top_rated=true&type=movie"
          />
        </div>
      </div>
    </>
  );
}