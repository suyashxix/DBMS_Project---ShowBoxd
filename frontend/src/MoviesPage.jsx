import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './Authcontext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const GENRES = [
  'Action','Comedy','Drama','Thriller','Horror',
  'Romance','Sci-Fi','Animation','Documentary','Fantasy',
  'Crime','Adventure','Mystery'
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

  .mp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .mp-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #f8f6f2;
    min-height: 100vh;
    padding-bottom: 80px;
  }

  .mp-banner {
    position: relative;
    height: 520px;
    overflow: hidden;
    margin-bottom: 0;
  }
  .mp-banner-track {
    display: flex;
    height: 100%;
    transition: transform 0.7s cubic-bezier(0.4,0,0.2,1);
  }
  .mp-banner-slide {
    flex: 0 0 100%;
    position: relative;
    height: 100%;
  }
  .mp-banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
  }
  .mp-banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      rgba(10,10,10,0.96) 0%,
      rgba(10,10,10,0.75) 38%,
      rgba(10,10,10,0.25) 65%,
      transparent 100%
    );
  }
  .mp-banner-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0 80px 72px;
    max-width: 700px;
  }
  .mp-banner-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .mp-banner-tag {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #d4a853;
    background: rgba(212,168,83,0.15);
    border: 1px solid rgba(212,168,83,0.3);
    padding: 5px 12px;
    border-radius: 20px;
  }
  .mp-banner-num {
    font-family: 'DM Serif Display', serif;
    font-size: 13px;
    color: rgba(255,255,255,0.4);
  }
  .mp-banner-title {
    font-family: 'DM Serif Display', serif;
    font-size: 58px;
    font-weight: 400;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }
  .mp-banner-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }
  .mp-banner-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 15px;
    color: #d4a853;
    font-weight: 500;
  }
  .mp-banner-genre {
    font-size: 14px;
    color: rgba(255,255,255,0.55);
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255,255,255,0.1);
  }
  .mp-banner-year {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
  }
  .mp-banner-desc {
    font-size: 16px;
    color: rgba(255,255,255,0.8);
    line-height: 1.65;
    margin-bottom: 36px;
    max-width: 520px;
  }
  .mp-banner-actions {
    display: flex;
    gap: 14px;
  }
  .mp-banner-btn {
    padding: 13px 30px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .mp-banner-btn.primary {
    background: #d4a853;
    color: #111;
  }
  .mp-banner-btn.primary:hover {
    background: #c49840;
    transform: translateY(-1px);
  }
  .mp-banner-btn.secondary {
    background: rgba(255,255,255,0.12);
    color: #fff;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.2);
  }
  .mp-banner-btn.secondary:hover {
    background: rgba(255,255,255,0.2);
  }

  .mp-banner-nav {
    position: absolute;
    bottom: 24px;
    left: 80px;
    display: flex;
    gap: 8px;
    z-index: 2;
  }
  .mp-banner-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .mp-banner-dot.active {
    width: 28px;
    border-radius: 4px;
    background: #d4a853;
  }

  .mp-banner-arrow {
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
    z-index: 3;
    transition: all 0.2s;
  }
  .mp-banner-arrow:hover {
    background: rgba(255,255,255,0.3);
  }
  .mp-banner-arrow.left { left: 24px; }
  .mp-banner-arrow.right { right: 24px; }

  .mp-genre-strip {
    background: #111;
    border-bottom: 1px solid #1e1e1e;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .mp-genre-strip::-webkit-scrollbar { display: none; }
  .mp-genre-inner {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0 48px;
    max-width: 1440px;
    margin: 0 auto;
  }
  .mp-genre-pill {
    padding: 16px 20px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    white-space: nowrap;
    cursor: pointer;
    border: none;
    background: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    border-bottom: 2px solid transparent;
    text-decoration: none;
    display: block;
  }
  .mp-genre-pill:hover { color: #fff; }
  .mp-genre-pill.active {
    color: #d4a853;
    border-bottom-color: #d4a853;
  }

  .mp-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 48px;
  }
  .mp-section { margin-top: 56px; }
  .mp-section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .mp-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 30px;
    font-weight: 400;
    color: #111;
  }
  .mp-section-link {
    font-size: 13px;
    font-weight: 500;
    color: #1a6b3c;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: gap 0.2s;
  }
  .mp-section-link:hover { gap: 8px; }

  .mp-scroll-wrap { position: relative; }
  .mp-scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-62%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.96);
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
  .mp-scroll-btn:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.14); }
  .mp-scroll-btn.left { left: -20px; }
  .mp-scroll-btn.right { right: -20px; }

  .mp-scroll-row {
    display: flex;
    gap: 18px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
  }
  .mp-scroll-row::-webkit-scrollbar { display: none; }

  .mp-card {
    flex: 0 0 190px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.22s;
    cursor: pointer;
  }
  .mp-card:hover { transform: translateY(-6px); }
  .mp-card-poster-wrap {
    position: relative;
    width: 190px;
    height: 285px;
    border-radius: 10px;
    overflow: hidden;
    background: #e4e0d8;
    box-shadow: 0 4px 18px rgba(0,0,0,0.12);
  }
  .mp-card-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
  }
  .mp-card:hover .mp-card-poster { transform: scale(1.04); }
  .mp-card-poster-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .mp-card:hover .mp-card-poster-overlay { opacity: 1; }
  .mp-card-hover-detail {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 14px 12px 12px;
    opacity: 0;
    transition: opacity 0.25s;
  }
  .mp-card:hover .mp-card-hover-detail { opacity: 1; }
  .mp-card-hover-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
    color: #d4a853;
    margin-bottom: 6px;
  }
  .mp-card-hover-btn {
    display: block;
    text-align: center;
    padding: 7px 0;
    border-radius: 6px;
    background: #d4a853;
    color: #111;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
  }
  .mp-card-info { padding: 12px 2px 0; }
  .mp-card-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    margin-bottom: 5px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }
  .mp-card-year { font-size: 12px; color: #999; }

  .mp-wide-card {
    flex: 0 0 260px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.22s;
  }
  .mp-wide-card:hover { transform: translateY(-4px); }
  .mp-wide-poster {
    width: 260px;
    height: 150px;
    border-radius: 10px;
    object-fit: cover;
    background: #e4e0d8;
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
  }
  .mp-wide-info { padding: 10px 2px 0; }
  .mp-wide-title {
    font-size: 14px;
    font-weight: 500;
    color: #111;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .mp-wide-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #888;
  }
  .mp-wide-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #ccc;
    display: inline-block;
  }

  .mp-genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
  .mp-genre-card {
    position: relative;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.2s;
  }
  .mp-genre-card:hover { transform: scale(1.02); }
  .mp-genre-card-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
  }
  .mp-genre-card-overlay {
    position: absolute;
    inset: 0;
  }
  .mp-genre-card-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  .mp-empty {
    text-align: center;
    padding: 48px;
    color: #aaa;
    font-size: 15px;
  }
  .mp-loading {
    text-align: center;
    padding: 48px;
    color: #bbb;
  }
  .mp-spinner {
    display: inline-block;
    width: 28px;
    height: 28px;
    border: 3px solid #e4e0d8;
    border-top-color: #d4a853;
    border-radius: 50%;
    animation: mp-spin 0.7s linear infinite;
    margin-bottom: 12px;
  }
  @keyframes mp-spin { to { transform: rotate(360deg); } }

  .mp-ribbon {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fff;
    background: #e63946;
    padding: 3px 8px;
    border-radius: 4px;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
  }
  .mp-ribbon-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #fff;
    animation: mp-pulse 1.4s ease infinite;
  }
  @keyframes mp-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  @media (max-width: 768px) {
    .mp-banner-content { padding: 0 24px 48px; }
    .mp-banner-title { font-size: 36px; }
    .mp-banner-nav { left: 24px; }
    .mp-container { padding: 0 20px; }
    .mp-genre-inner { padding: 0 20px; }
  }
`;

const ChevLeft = () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
const ChevRight = () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);
const Star = ({ size = 15 }) => (
    <svg width={size} height={size} fill="#d4a853" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);
const ArrowRight = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);
const PlayIcon = () => (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
);

const GENRE_COLORS = {
  Action: ['#c0392b', '#e74c3c'],
  Comedy: ['#f39c12', '#f1c40f'],
  Drama: ['#2c3e50', '#34495e'],
  Thriller: ['#1a1a2e', '#16213e'],
  Horror: ['#1a0a0a', '#4a0a0a'],
  Romance: ['#c0392b', '#e91e8c'],
  'Sci-Fi': ['#0d47a1', '#1565c0'],
  Animation: ['#6a1b9a', '#9c27b0'],
  Documentary: ['#1b5e20', '#2e7d32'],
  Fantasy: ['#4a148c', '#7b1fa2'],
  Crime: ['#212121', '#424242'],
  Adventure: ['#e65100', '#f57c00'],
  Mystery: ['#1a237e', '#283593'],
  Biography: ['#37474f', '#546e7a'],
};

function ScrollRow({ title, items, loading, linkTo, wide = false }) {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d === 'left' ? -520 : 520, behavior: 'smooth' });

  return (
      <div className="mp-section">
        <div className="mp-section-header">
          <h2 className="mp-section-title">{title}</h2>
          {linkTo && (
              <Link to={linkTo} className="mp-section-link">View all <ArrowRight /></Link>
          )}
        </div>
        <div className="mp-scroll-wrap">
          <button className="mp-scroll-btn left" onClick={() => scroll('left')}><ChevLeft /></button>
          <div className="mp-scroll-row" ref={ref}>
            {loading ? (
                <div className="mp-loading"><div className="mp-spinner" /></div>
            ) : items.length === 0 ? (
                <div className="mp-empty">Nothing here yet</div>
            ) : items.map((item) =>
                wide ? (
                    <Link to={`/media/${item.media_id}`} className="mp-wide-card" key={item.media_id}>
                      {item.poster_url
                          ? <img src={item.poster_url} alt={item.title} className="mp-wide-poster" />
                          : <div className="mp-wide-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
                      }
                      <div className="mp-wide-info">
                        <div className="mp-wide-title">{item.title}</div>
                        <div className="mp-wide-meta">
                          {item.aggregate_rating && <><Star size={12} /> {item.aggregate_rating}</>}
                          <span className="mp-wide-dot" />
                          <span>{item.release_year || '—'}</span>
                        </div>
                      </div>
                    </Link>
                ) : (
                    <Link to={`/media/${item.media_id}`} className="mp-card" key={item.media_id}>
                      <div className="mp-card-poster-wrap">
                        {item.nowShowing && (
                            <span className="mp-ribbon"><span className="mp-ribbon-dot" />Now Showing</span>
                        )}
                        {item.poster_url
                            ? <img src={item.poster_url} alt={item.title} className="mp-card-poster" />
                            : <div className="mp-card-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🎬</div>
                        }
                        <div className="mp-card-poster-overlay" />
                        <div className="mp-card-hover-detail">
                          {item.aggregate_rating && (
                              <div className="mp-card-hover-rating"><Star /> {item.aggregate_rating}</div>
                          )}
                          <span className="mp-card-hover-btn">View Details</span>
                        </div>
                      </div>
                      <div className="mp-card-info">
                        <div className="mp-card-title">{item.title}</div>
                        <div className="mp-card-year">{item.release_year || ''}</div>
                      </div>
                    </Link>
                )
            )}
          </div>
          <button className="mp-scroll-btn right" onClick={() => scroll('right')}><ChevRight /></button>
        </div>
      </div>
  );
}

export default function MoviesPage() {
  const { user } = useAuth();

  const [slide, setSlide] = useState(0);
  const [bannerMovies, setBannerMovies] = useState([]);
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState({
    popular: true,
    trending: true,
    topRated: true,
    nowShowing: true,
    newReleases: true,
    recommended: false,
    genre: false,
  });

  const setL = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  const fetchMovies = async (params, setter, key) => {
    try {
      const res = await axios.get(`${API}/api/search/`, { params: { type: 'movie', ...params } });
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setter(data.slice(0, 14));
    } catch {
      setter([]);
    } finally {
      setL(key, false);
    }
  };

  useEffect(() => { fetchMovies({ sort: 'popular' }, setPopular, 'popular'); }, []);
  useEffect(() => {
    axios.get(`${API}/api/trending/`)
        .then(r => {
          const d = Array.isArray(r.data) ? r.data : (r.data.results ?? []);
          setTrending(d.filter(i => i.media_type === 'movie').slice(0, 14));
        })
        .catch(() => setTrending([]))
        .finally(() => setL('trending', false));
  }, []);
  useEffect(() => { fetchMovies({ top_rated: 'true' }, setTopRated, 'topRated'); }, []);
  useEffect(() => {
    axios.get(`${API}/api/nowshowing/`)
        .then(r => {
          const d = Array.isArray(r.data) ? r.data : (r.data.results ?? []);
          setNowShowing(d.slice(0, 14).map(i => ({ ...i, nowShowing: true })));
        })
        .catch(() => setNowShowing([]))
        .finally(() => setL('nowShowing', false));
  }, []);
  useEffect(() => { fetchMovies({ sort: 'newest' }, setNewReleases, 'newReleases'); }, []);

  useEffect(() => {
    if (!user) {
      setL('recommended', false);
      return;
    }
    setL('recommended', true);
    axios.get(`${API}/api/user/${user.user_id}/recommendations/`)
        .then(r => {
          const d = Array.isArray(r.data) ? r.data : (r.data.results ?? []);
          setRecommended(d.filter(i => i.media_type === 'movie').slice(0, 14));
        })
        .catch(() => setRecommended([]))
        .finally(() => setL('recommended', false));
  }, [user]);

  useEffect(() => {
    axios.get(`${API}/api/search/`, { params: { type: 'movie' } })
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
          const sorted = data
              .filter(i => i.release_date)
              .sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
          setBannerMovies(sorted.slice(0, 5));
        })
        .catch(() => setBannerMovies([]));
  }, []);

  const handleGenre = (genre) => {
    if (activeGenre === genre) {
      setActiveGenre(null);
      setGenreMovies([]);
      return;
    }
    setActiveGenre(genre);
    setL('genre', true);
    axios.get(`${API}/api/search/`, { params: { type: 'movie', genre } })
        .then(r => {
          const d = Array.isArray(r.data) ? r.data : (r.data.results ?? []);
          setGenreMovies(d.slice(0, 14));
        })
        .catch(() => setGenreMovies([]))
        .finally(() => setL('genre', false));
  };

  useEffect(() => {
    if (bannerMovies.length === 0) return;
    const t = setInterval(() => setSlide(p => (p + 1) % bannerMovies.length), 6500);
    return () => clearInterval(t);
  }, [bannerMovies.length]);

  const prevSlide = () => {
    if (bannerMovies.length === 0) return;
    setSlide(p => (p - 1 + bannerMovies.length) % bannerMovies.length);
  };

  const nextSlide = () => {
    if (bannerMovies.length === 0) return;
    setSlide(p => (p + 1) % bannerMovies.length);
  };

  return (
      <>
        <style>{styles}</style>
        <div className="mp-wrap">
          <div className="mp-banner">
            {bannerMovies.length > 0 ? (
                <>
                  <div className="mp-banner-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
                    {bannerMovies.map((m, i) => (
                        <div className="mp-banner-slide" key={m.media_id}>
                          {m.poster_url
                              ? <img src={m.poster_url} alt={m.title} className="mp-banner-img" />
                              : <div className="mp-banner-img" style={{ background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🎬</div>
                          }
                          <div className="mp-banner-overlay" />
                          <div className="mp-banner-content">
                            <h1 className="mp-banner-title">{m.title}</h1>
                            <div className="mp-banner-meta">
                              {m.aggregate_rating && (
                                  <span className="mp-banner-rating"><Star size={17} /> {m.aggregate_rating}</span>
                              )}
                              {m.release_year && <span className="mp-banner-year">{m.release_year}</span>}
                            </div>
                            {m.description && (
                                <p className="mp-banner-desc">
                                  {m.description.length > 180 ? m.description.slice(0, 180) + '…' : m.description}
                                </p>
                            )}
                            <div className="mp-banner-actions">
                              <Link to={`/media/${m.media_id}`} className="mp-banner-btn primary">
                                <PlayIcon /> Watch Details
                              </Link>
                              <Link to={`/media/${m.media_id}`} className="mp-banner-btn secondary">
                                + Watchlist
                              </Link>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>

                  <div className="mp-banner-nav">
                    {bannerMovies.map((_, i) => (
                        <button key={i} className={`mp-banner-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
                    ))}
                  </div>

                  <button className="mp-banner-arrow left" onClick={prevSlide}>
                    <ChevLeft />
                  </button>
                  <button className="mp-banner-arrow right" onClick={nextSlide}>
                    <ChevRight />
                  </button>
                </>
            ) : (
                <div style={{ height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="mp-spinner" />
                </div>
            )}
          </div>

          <div className="mp-genre-strip">
            <div className="mp-genre-inner">
              <button
                  className={`mp-genre-pill ${!activeGenre ? 'active' : ''}`}
                  onClick={() => { setActiveGenre(null); setGenreMovies([]); }}
              >
                All
              </button>
              {GENRES.map(g => (
                  <button
                      key={g}
                      className={`mp-genre-pill ${activeGenre === g ? 'active' : ''}`}
                      onClick={() => handleGenre(g)}
                  >
                    {g}
                  </button>
              ))}
            </div>
          </div>

          <div className="mp-container">
            {activeGenre && (
                <ScrollRow
                    title={`${activeGenre} Movies`}
                    items={genreMovies}
                    loading={loading.genre}
                />
            )}

            <ScrollRow title="Now Showing" items={nowShowing} loading={loading.nowShowing} linkTo="/nowshowing" />
            <ScrollRow title="Popular Movies" items={popular} loading={loading.popular} />
            <ScrollRow title="Trending This Week" items={trending} loading={loading.trending} linkTo="/trending" />

            {user && recommended.length > 0 && (
                <ScrollRow title="Picked for You" items={recommended} loading={loading.recommended} />
            )}

            <ScrollRow title="All-Time Top Rated" items={topRated} loading={loading.topRated} linkTo="/home?top_rated=true&type=movie" />
            <ScrollRow title="New Releases" items={newReleases} loading={loading.newReleases} wide />

            <div className="mp-section">
              <div className="mp-section-header">
                <h2 className="mp-section-title">Browse by Genre</h2>
              </div>
              <div className="mp-genre-grid">
                {GENRES.map(g => {
                  const [c1, c2] = GENRE_COLORS[g] || ['#333', '#555'];
                  return (
                      <button
                          key={g}
                          className="mp-genre-card"
                          onClick={() => handleGenre(g)}
                          style={{ border: 'none' }}
                      >
                        <div className="mp-genre-card-overlay" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
                        <div className="mp-genre-card-label">{g}</div>
                      </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
  );
}