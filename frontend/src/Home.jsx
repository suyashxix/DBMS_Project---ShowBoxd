import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
    top: 50%;
    left: 64px;
    transform: translateY(-50%);
    max-width: 560px;
    color: #fff;
  }
  .hm-hero-tag {
    display: inline-block;
    background: #d4a853;
    color: #111;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 6px 14px;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  .hm-hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 48px;
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: 16px;
    text-wrap: balance;
  }
  .hm-hero-desc {
    font-size: 16px;
    color: rgba(255,255,255,0.75);
    line-height: 1.65;
    margin-bottom: 28px;
  }
  .hm-hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  .hm-hero-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 26px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
  }
  .hm-hero-btn.primary {
    background: #fff;
    color: #111;
  }
  .hm-hero-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }
  .hm-hero-btn.secondary {
    background: rgba(255,255,255,0.12);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.25);
    backdrop-filter: blur(8px);
  }
  .hm-hero-btn.secondary:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(255,255,255,0.4);
  }

  /* Hero Navigation */
  .hm-hero-nav {
    position: absolute;
    bottom: 40px;
    right: 64px;
    display: flex;
    gap: 12px;
  }
  .hm-hero-arrow {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .hm-hero-arrow:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.05);
  }
  .hm-hero-dots {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
  }
  .hm-hero-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    border: none;
    cursor: pointer;
    transition: all 0.25s;
  }
  .hm-hero-dot.active {
    background: #fff;
    transform: scale(1.3);
  }

  /* Main Content */
  .hm-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 48px;
  }

  /* Section */
  .hm-section {
    margin-bottom: 56px;
  }
  .hm-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .hm-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 30px;
    font-weight: 400;
    color: #111;
  }
  .hm-section-link {
    font-size: 14px;
    font-weight: 500;
    color: #888;
    text-decoration: none;
    transition: color 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .hm-section-link:hover { color: #111; }

  /* Scroll Row */
  .hm-scroll-wrap {
    position: relative;
  }
  .hm-scroll-row {
    display: flex;
    gap: 24px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 8px 4px 20px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .hm-scroll-row::-webkit-scrollbar { display: none; }
  .hm-scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #e4e0d8;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s;
    color: #333;
  }
  .hm-scroll-btn:hover {
    transform: translateY(-50%) scale(1.08);
    box-shadow: 0 6px 24px rgba(0,0,0,0.12);
    color: #111;
  }
  .hm-scroll-btn.left { left: -24px; }
  .hm-scroll-btn.right { right: -24px; }

  /* Media Card */
  .hm-card {
    flex: 0 0 220px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.25s, box-shadow 0.25s;
    border: 1px solid #ebe8e2;
  }
  .hm-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.1);
  }
  .hm-card-poster-wrap {
    position: relative;
    aspect-ratio: 2/3;
    background: #1a1a1a;
    overflow: hidden;
  }
  .hm-card-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
  }
  .hm-card:hover .hm-card-poster {
    transform: scale(1.06);
  }
  .hm-card-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #1f1f1f, #2d2d2d);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #444;
  }
  .hm-card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.45);
    opacity: 0;
    transition: opacity 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hm-card:hover .hm-card-overlay { opacity: 1; }
  .hm-card-action {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255,255,255,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
    transform: scale(0.85);
    transition: transform 0.2s;
  }
  .hm-card:hover .hm-card-action {
    transform: scale(1);
  }
  .hm-card-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(17,17,17,0.8);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 5px 10px;
    border-radius: 6px;
    backdrop-filter: blur(4px);
  }
  .hm-card-body {
    padding: 16px 18px 20px;
  }
  .hm-card-title {
    font-size: 15px;
    font-weight: 500;
    color: #111;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .hm-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hm-card-rating {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 600;
    color: #111;
  }
  .hm-card-rating svg { color: #d4a853; }
  .hm-card-year {
    font-size: 13px;
    color: #999;
  }

  /* Loading Skeletons */
  .hm-skeleton {
    background: linear-gradient(90deg, #eae7e0 25%, #f5f3ef 50%, #eae7e0 75%);
    background-size: 200% 100%;
    animation: hm-shimmer 1.5s infinite;
    border-radius: 16px;
  }
  @keyframes hm-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .hm-skeleton-card {
    flex: 0 0 220px;
    aspect-ratio: 2/3.4;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .hm-hero-slide { height: 440px; }
    .hm-hero-content { left: 48px; max-width: 480px; }
    .hm-hero-title { font-size: 38px; }
    .hm-hero-nav { right: 48px; }
    .hm-main { padding: 0 32px; }
    .hm-scroll-btn { display: none; }
  }
  @media (max-width: 768px) {
    .hm-hero-slide { height: 400px; }
    .hm-hero-content { left: 28px; right: 28px; max-width: none; }
    .hm-hero-title { font-size: 30px; }
    .hm-hero-desc { font-size: 14px; }
    .hm-hero-nav { display: none; }
    .hm-main { padding: 0 20px; }
    .hm-section-title { font-size: 24px; }
    .hm-card { flex: 0 0 160px; border-radius: 12px; }
    .hm-card-body { padding: 12px 14px 16px; }
    .hm-card-title { font-size: 13px; margin-bottom: 8px; }
  }
`;

// Featured news for movie booking/review platform
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

const TicketIcon = () => (
  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 104 0V7a2 2 0 00-2-2zm0 0h14a2 2 0 012 2v3a2 2 0 11-4 0V7m4 0a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2" />
  </svg>
);

const FilmIcon = () => (
  <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
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
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="hm-skeleton hm-skeleton-card" />
            ))
          ) : (
            items.map((item) => (
              <Link to={`/media/${item.media_id}`} className="hm-card" key={item.media_id}>
                <div className="hm-card-poster-wrap">
                  {item.poster_url ? (
                    <img
                      className="hm-card-poster"
                      src={item.poster_url}
                      alt={item.title}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="hm-card-placeholder">
                      <FilmIcon />
                    </div>
                  )}
                  <span className="hm-card-badge">
                    {item.media_type === 'tv_show' ? 'TV Series' : 'Movie'}
                  </span>
                  <div className="hm-card-overlay">
                    <div className="hm-card-action">
                      <TicketIcon />
                    </div>
                  </div>
                </div>
                <div className="hm-card-body">
                  <div className="hm-card-title">{item.title}</div>
                  <div className="hm-card-meta">
                    <span className="hm-card-rating">
                      <StarIcon />
                      {item.aggregate_rating && !isNaN(item.aggregate_rating)
                        ? Number(item.aggregate_rating).toFixed(1)
                        : 'N/A'}
                    </span>
                    <span className="hm-card-year">
                      {item.release_date ? new Date(item.release_date).getFullYear() : ''}
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [recommendedShows, setRecommendedShows] = useState([]);
  const [loading, setLoading] = useState({
    trendingMovies: true,
    trendingShows: true,
    recommendedMovies: true,
    recommendedShows: true,
  });

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_NEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    axios
      .get(`${API}/api/search/`, { params: { top_rated: 'true', type: 'movie' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setTrendingMovies(data.slice(0, 12));
      })
      .catch(() => setTrendingMovies([]))
      .finally(() => setLoading((prev) => ({ ...prev, trendingMovies: false })));
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/api/search/`, { params: { top_rated: 'true', type: 'tv_show' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setTrendingShows(data.slice(0, 12));
      })
      .catch(() => setTrendingShows([]))
      .finally(() => setLoading((prev) => ({ ...prev, trendingShows: false })));
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/api/catalog/`, { params: { type: 'movie' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setRecommendedMovies(data.slice(0, 12));
      })
      .catch(() => setRecommendedMovies([]))
      .finally(() => setLoading((prev) => ({ ...prev, recommendedMovies: false })));
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/api/catalog/`, { params: { type: 'tv_show' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setRecommendedShows(data.slice(0, 12));
      })
      .catch(() => setRecommendedShows([]))
      .finally(() => setLoading((prev) => ({ ...prev, recommendedShows: false })));
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
          <div className="hm-hero-nav">
            <button className="hm-hero-arrow" onClick={prevSlide}>
              <ChevronLeftIcon />
            </button>
            <button className="hm-hero-arrow" onClick={nextSlide}>
              <ChevronRightIcon />
            </button>
          </div>
          <div className="hm-hero-dots">
            {FEATURED_NEWS.map((_, i) => (
              <button
                key={i}
                className={`hm-hero-dot ${i === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </div>

        {/* Content Rows */}
        <main className="hm-main">
          <ScrollRow
            title="Trending Movies"
            items={trendingMovies}
            loading={loading.trendingMovies}
            linkTo="/home?type=movie&top_rated=true"
          />
          <ScrollRow
            title="Trending TV Shows"
            items={trendingShows}
            loading={loading.trendingShows}
            linkTo="/home?type=tv_show&top_rated=true"
          />
          <ScrollRow
            title="Recommended Movies"
            items={recommendedMovies}
            loading={loading.recommendedMovies}
            linkTo="/home?type=movie"
          />
          <ScrollRow
            title="Recommended TV Shows"
            items={recommendedShows}
            loading={loading.recommendedShows}
            linkTo="/home?type=tv_show"
          />
        </main>
      </div>
    </>
  );
}
