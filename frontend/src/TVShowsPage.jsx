import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Authcontext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const GENRES = [
  'Drama','Comedy','Thriller','Crime','Sci-Fi',
  'Fantasy','Horror','Mystery','Romance','Documentary',
  'Action','Animation','Biography','Adventure',
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

  .tv-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .tv-wrap {
    font-family: 'DM Sans', sans-serif;
    background: #0d0d0d;
    min-height: 100vh;
    padding-bottom: 80px;
    color: #eee;
  }

  /* ── Hero Banner ── */
  .tv-banner {
    position: relative; height: 600px;
    overflow: hidden; margin-bottom: 0;
  }
  .tv-banner-track {
    display: flex; height: 100%;
    transition: transform 0.75s cubic-bezier(0.4,0,0.2,1);
  }
  .tv-banner-slide {
    flex: 0 0 100%; position: relative; height: 100%;
  }
  .tv-banner-img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: center 15%;
    filter: brightness(0.55);
  }
  .tv-banner-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to right,
      rgba(5,5,5,0.98) 0%,
      rgba(5,5,5,0.75) 42%,
      rgba(5,5,5,0.15) 70%,
      transparent 100%
    );
  }
  .tv-banner-bottom {
    position: absolute; bottom: 0; left: 0; right: 0; height: 160px;
    background: linear-gradient(to top, #0d0d0d, transparent);
  }
  .tv-banner-content {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 0 80px;
    max-width: 680px;
  }
  .tv-banner-label {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 18px;
  }
  .tv-banner-badge {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #111; background: #e5c07b;
    padding: 5px 12px; border-radius: 4px;
  }
  .tv-banner-ep {
    font-size: 13px; color: rgba(255,255,255,0.35);
    font-family: 'DM Serif Display', serif; font-style: italic;
  }
  .tv-banner-title {
    font-family: 'DM Serif Display', serif;
    font-size: 62px; font-weight: 400;
    color: #fff; line-height: 1.08;
    margin-bottom: 18px; letter-spacing: -0.02em;
  }
  .tv-banner-tags {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 18px;
  }
  .tv-banner-chip {
    font-size: 12px; color: rgba(255,255,255,0.55);
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 4px 11px; border-radius: 4px;
  }
  .tv-banner-rating {
    display: flex; align-items: center; gap: 5px;
    font-size: 15px; color: #e5c07b; font-weight: 600;
    margin-bottom: 18px;
  }
  .tv-banner-desc {
    font-size: 15px; color: rgba(255,255,255,0.7);
    line-height: 1.65; margin-bottom: 36px;
    max-width: 500px;
  }
  .tv-banner-actions { display: flex; gap: 12px; }
  .tv-banner-btn {
    padding: 12px 28px; border-radius: 8px;
    font-size: 14px; font-weight: 600;
    text-decoration: none; cursor: pointer; border: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .tv-banner-btn.primary {
    background: #e5c07b; color: #111;
  }
  .tv-banner-btn.primary:hover { background: #d4a853; }
  .tv-banner-btn.secondary {
    background: rgba(255,255,255,0.1); color: #fff;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.18);
  }
  .tv-banner-btn.secondary:hover { background: rgba(255,255,255,0.18); }

  /* Banner nav */
  .tv-banner-nav {
    position: absolute; bottom: 32px; right: 80px;
    display: flex; gap: 8px; z-index: 2;
  }
  .tv-banner-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    cursor: pointer; border: none;
    transition: all 0.2s;
  }
  .tv-banner-dot.active {
    width: 24px; border-radius: 3px;
    background: #e5c07b;
  }

  /* Genre strip */
  .tv-genre-strip {
    background: #0d0d0d;
    border-bottom: 1px solid #1a1a1a;
    overflow-x: auto; scrollbar-width: none;
  }
  .tv-genre-strip::-webkit-scrollbar { display: none; }
  .tv-genre-inner {
    display: flex; align-items: center;
    padding: 0 48px;
    max-width: 1440px; margin: 0 auto;
  }
  .tv-genre-pill {
    padding: 16px 18px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.35);
    white-space: nowrap; cursor: pointer;
    border: none; background: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    border-bottom: 2px solid transparent;
  }
  .tv-genre-pill:hover { color: rgba(255,255,255,0.8); }
  .tv-genre-pill.active {
    color: #e5c07b;
    border-bottom-color: #e5c07b;
  }

  /* Sections */
  .tv-container {
    max-width: 1440px; margin: 0 auto;
    padding: 0 48px;
  }
  .tv-section { margin-top: 56px; }
  .tv-section-header {
    display: flex; align-items: baseline;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .tv-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; font-weight: 400; color: #f0ede8;
  }
  .tv-section-link {
    font-size: 13px; font-weight: 500;
    color: #e5c07b; text-decoration: none;
    display: flex; align-items: center; gap: 4px;
    transition: gap 0.2s; opacity: 0.8;
  }
  .tv-section-link:hover { gap: 8px; opacity: 1; }

  /* Scroll row */
  .tv-scroll-wrap { position: relative; }
  .tv-scroll-btn {
    position: absolute; top: 50%; transform: translateY(-62%);
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12); color: #fff;
    cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    z-index: 2; transition: all 0.2s;
  }
  .tv-scroll-btn:hover { background: rgba(255,255,255,0.16); }
  .tv-scroll-btn.left { left: -18px; }
  .tv-scroll-btn.right { right: -18px; }

  .tv-scroll-row {
    display: flex; gap: 16px;
    overflow-x: auto; scroll-behavior: smooth;
    scrollbar-width: none;
  }
  .tv-scroll-row::-webkit-scrollbar { display: none; }

  /* Poster card */
  .tv-card {
    flex: 0 0 185px; text-decoration: none;
    color: inherit; transition: transform 0.22s;
  }
  .tv-card:hover { transform: translateY(-6px); }
  .tv-card-poster-wrap {
    position: relative; width: 185px; height: 278px;
    border-radius: 8px; overflow: hidden;
    background: #1a1a1a;
    box-shadow: 0 4px 20px rgba(0,0,0,0.45);
  }
  .tv-card-poster {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.4s;
  }
  .tv-card:hover .tv-card-poster { transform: scale(1.04); }
  .tv-card-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
    opacity: 0; transition: opacity 0.25s;
  }
  .tv-card:hover .tv-card-overlay { opacity: 1; }
  .tv-card-hover {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 12px 10px 10px;
    opacity: 0; transition: opacity 0.25s;
  }
  .tv-card:hover .tv-card-hover { opacity: 1; }
  .tv-card-hover-rating {
    display: flex; align-items: center; gap: 4px;
    font-size: 13px; font-weight: 600; color: #e5c07b;
    margin-bottom: 6px;
  }
  .tv-card-hover-btn {
    display: block; text-align: center;
    padding: 6px 0; border-radius: 5px;
    background: #e5c07b; color: #111;
    font-size: 11px; font-weight: 700;
    text-decoration: none;
  }
  .tv-airing-badge {
    position: absolute; top: 8px; right: 8px;
    background: #e63946; color: #fff;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 3px 7px; border-radius: 3px;
    display: flex; align-items: center; gap: 4px;
  }
  .tv-airing-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #fff; animation: tv-pulse 1.4s ease infinite;
  }
  @keyframes tv-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .tv-card-info { padding: 10px 2px 0; }
  .tv-card-title {
    font-size: 13px; font-weight: 500; color: #ddd;
    margin-bottom: 4px;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
    line-height: 1.4;
  }
  .tv-card-sub { font-size: 11px; color: #666; }

  /* Network/status row card */
  .tv-net-card {
    flex: 0 0 280px; text-decoration: none;
    color: inherit; transition: transform 0.22s;
  }
  .tv-net-card:hover { transform: translateY(-4px); }
  .tv-net-thumb {
    width: 280px; height: 158px;
    border-radius: 8px; object-fit: cover;
    background: #1a1a1a;
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    display: block;
  }
  .tv-net-info { padding: 10px 2px 0; }
  .tv-net-title {
    font-size: 14px; font-weight: 500; color: #ddd;
    margin-bottom: 4px;
    display: -webkit-box; -webkit-line-clamp: 1;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .tv-net-meta {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: #555;
  }
  .tv-net-sep { color: #333; }

  /* Genre grid */
  .tv-genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  .tv-genre-block {
    position: relative; height: 100px;
    border-radius: 8px; overflow: hidden;
    cursor: pointer; border: none;
    transition: transform 0.2s; width: 100%;
  }
  .tv-genre-block:hover { transform: scale(1.03); }
  .tv-genre-block-bg {
    position: absolute; inset: 0;
  }
  .tv-genre-block-label {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 20px; color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }

  .tv-empty { text-align: center; padding: 48px; color: #444; font-size: 15px; }
  .tv-loading { text-align: center; padding: 48px; }
  .tv-spinner {
    display: inline-block; width: 26px; height: 26px;
    border: 3px solid #222;
    border-top-color: #e5c07b;
    border-radius: 50%;
    animation: tv-spin 0.7s linear infinite;
  }
  @keyframes tv-spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .tv-banner-content { padding: 0 24px; }
    .tv-banner-title { font-size: 38px; }
    .tv-banner-nav { right: 24px; }
    .tv-container { padding: 0 20px; }
    .tv-genre-inner { padding: 0 20px; }
  }
`;

const ChevLeft = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevRight = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const Star = ({ size = 14 }) => (
  <svg width={size} height={size} fill="#e5c07b" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const ArrowRight = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const PlayIcon = () => (
  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const GENRE_COLORS = {
  Drama:     ['#1a1a2e','#16213e'], Comedy:   ['#1e3a1e','#2d5a2d'],
  Thriller:  ['#1c1005','#3a2010'], Crime:    ['#0d0d0d','#1a1a1a'],
  'Sci-Fi':  ['#050e24','#0d1b3e'], Fantasy:  ['#1a0533','#2d0f52'],
  Horror:    ['#1a0000','#330000'], Mystery:  ['#0a0a20','#151530'],
  Romance:   ['#2a0515','#4a0a25'], Documentary:['#051a10','#0a2d1c'],
  Action:    ['#1a0500','#3a0d00'], Animation:['#0a1a2a','#102a40'],
  Biography: ['#1a1508','#2d2510'], Adventure:['#0d1a0a','#152810'],
};

function ScrollRow({ title, items, loading, linkTo, wide = false }) {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d === 'left' ? -520 : 520, behavior: 'smooth' });

  return (
    <div className="tv-section">
      <div className="tv-section-header">
        <h2 className="tv-section-title">{title}</h2>
        {linkTo && <Link to={linkTo} className="tv-section-link">View all <ArrowRight /></Link>}
      </div>
      <div className="tv-scroll-wrap">
        <button className="tv-scroll-btn left" onClick={() => scroll('left')}><ChevLeft /></button>
        <div className="tv-scroll-row" ref={ref}>
          {loading ? (
            <div className="tv-loading"><div className="tv-spinner" /></div>
          ) : items.length === 0 ? (
            <div className="tv-empty">Nothing here yet</div>
          ) : items.map((item) =>
            wide ? (
              <Link to={`/media/${item.media_id}`} className="tv-net-card" key={item.media_id}>
                {item.poster_url
                  ? <img src={item.poster_url} alt={item.title} className="tv-net-thumb" />
                  : <div className="tv-net-thumb" style={{ display:'flex',alignItems:'center',justifyContent:'center',fontSize:40 }}>📺</div>
                }
                <div className="tv-net-info">
                  <div className="tv-net-title">{item.title}</div>
                  <div className="tv-net-meta">
                    {item.aggregate_rating && <><Star size={12} /> {item.aggregate_rating}</>}
                    <span className="tv-net-sep">·</span>
                    <span>{item.release_year || '—'}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <Link to={`/media/${item.media_id}`} className="tv-card" key={item.media_id}>
                <div className="tv-card-poster-wrap">
                  {item.airing && (
                    <span className="tv-airing-badge"><span className="tv-airing-dot" />Airing</span>
                  )}
                  {item.poster_url
                    ? <img src={item.poster_url} alt={item.title} className="tv-card-poster" />
                    : <div className="tv-card-poster" style={{ display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,background:'#1a1a1a' }}>📺</div>
                  }
                  <div className="tv-card-overlay" />
                  <div className="tv-card-hover">
                    {item.aggregate_rating && (
                      <div className="tv-card-hover-rating"><Star /> {item.aggregate_rating}</div>
                    )}
                    <span className="tv-card-hover-btn">View Show</span>
                  </div>
                </div>
                <div className="tv-card-info">
                  <div className="tv-card-title">{item.title}</div>
                  <div className="tv-card-sub">{item.release_year || ''}</div>
                </div>
              </Link>
            )
          )}
        </div>
        <button className="tv-scroll-btn right" onClick={() => scroll('right')}><ChevRight /></button>
      </div>
    </div>
  );
}

export default function TVShowsPage() {
  const { user } = useAuth();

  const [slide, setSlide] = useState(0);
  const [bannerShows, setBannerShows] = useState([]);
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [airing, setAiring] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  const [genreShows, setGenreShows] = useState([]);
  const [loading, setLoading] = useState({
    popular: true, trending: true, topRated: true,
    airing: true, recommended: false, genre: false,
  });

  const setL = (k, v) => setLoading(p => ({ ...p, [k]: v }));

  const fetchShows = async (params, setter, key) => {
    try {
      const res = await axios.get(`${API}/api/search/`, { params: { type: 'tv_show', ...params } });
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setter(data.slice(0, 14));
    } catch { setter([]); } finally { setL(key, false); }
  };

  useEffect(() => { fetchShows({ sort: 'popular' }, setPopular, 'popular'); }, []);
  useEffect(() => {
    axios.get(`${API}/api/trending/`)
      .then(r => { const d = Array.isArray(r.data) ? r.data : (r.data.results ?? []); setTrending(d.filter(i => i.media_type === 'tv_show').slice(0, 14)); })
      .catch(() => setTrending([]))
      .finally(() => setL('trending', false));
  }, []);
  useEffect(() => { fetchShows({ top_rated: 'true' }, setTopRated, 'topRated'); }, []);
  useEffect(() => {
    // Currently airing — filter from search or use a dedicated param if available
    fetchShows({ airing: 'true' }, (data) => setAiring(data.map(i => ({...i, airing: true}))), 'airing');
  }, []);

  useEffect(() => {
    if (!user) return;
    setL('recommended', true);
    axios.get(`${API}/api/user/${user.user_id}/recommendations/`)
      .then(r => { const d = Array.isArray(r.data) ? r.data : (r.data.results ?? []); setRecommended(d.filter(i => i.media_type === 'tv_show').slice(0, 14)); })
      .catch(() => setRecommended([]))
      .finally(() => setL('recommended', false));
  }, [user]);

  // Build banner from popular + topRated
  useEffect(() => {
    const combined = [...popular, ...topRated].reduce((acc, item) => {
      if (!acc.find(x => x.media_id === item.media_id)) acc.push(item);
      return acc;
    }, []);
    setBannerShows(combined.slice(0, 5));
  }, [popular, topRated]);

  // Genre filtering
  const handleGenre = (genre) => {
    if (activeGenre === genre) { setActiveGenre(null); setGenreShows([]); return; }
    setActiveGenre(genre);
    setL('genre', true);
    axios.get(`${API}/api/search/`, { params: { type: 'tv_show', genre } })
      .then(r => { const d = Array.isArray(r.data) ? r.data : (r.data.results ?? []); setGenreShows(d.slice(0, 14)); })
      .catch(() => setGenreShows([]))
      .finally(() => setL('genre', false));
  };

  useEffect(() => {
    if (bannerShows.length === 0) return;
    const t = setInterval(() => setSlide(p => (p + 1) % bannerShows.length), 7000);
    return () => clearInterval(t);
  }, [bannerShows.length]);

  const current = bannerShows[slide];

  return (
    <>
      <style>{styles}</style>
      <div className="tv-wrap">

        {/* ── Hero Banner ── */}
        <div className="tv-banner">
          {bannerShows.length > 0 ? (
            <>
              <div className="tv-banner-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
                {bannerShows.map((s, i) => (
                  <div className="tv-banner-slide" key={s.media_id}>
                    {s.poster_url
                      ? <img src={s.poster_url} alt={s.title} className="tv-banner-img" />
                      : <div className="tv-banner-img" style={{ background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:90 }}>📺</div>
                    }
                    <div className="tv-banner-overlay" />
                    <div className="tv-banner-bottom" />
                    <div className="tv-banner-content">
                      <div className="tv-banner-label">
                        <span className="tv-banner-badge">📺 TV Series</span>
                        <span className="tv-banner-ep">{String(i+1).padStart(2,'0')} of {String(bannerShows.length).padStart(2,'0')}</span>
                      </div>
                      <h1 className="tv-banner-title">{s.title}</h1>
                      {s.aggregate_rating && (
                        <div className="tv-banner-rating"><Star size={18} /> {s.aggregate_rating}</div>
                      )}
                      {s.description && (
                        <p className="tv-banner-desc">
                          {s.description.length > 180 ? s.description.slice(0,180) + '…' : s.description}
                        </p>
                      )}
                      <div className="tv-banner-actions">
                        <Link to={`/media/${s.media_id}`} className="tv-banner-btn primary">
                          <PlayIcon /> View Series
                        </Link>
                        <Link to={`/media/${s.media_id}`} className="tv-banner-btn secondary">
                          + Watchlist
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tv-banner-nav">
                {bannerShows.map((_, i) => (
                  <button key={i} className={`tv-banner-dot ${i===slide?'active':''}`} onClick={() => setSlide(i)} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ height:'100%', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div className="tv-spinner" />
            </div>
          )}
        </div>

        {/* ── Genre Strip ── */}
        <div className="tv-genre-strip">
          <div className="tv-genre-inner">
            <button
              className={`tv-genre-pill ${!activeGenre ? 'active' : ''}`}
              onClick={() => { setActiveGenre(null); setGenreShows([]); }}
            >
              All Shows
            </button>
            {GENRES.map(g => (
              <button
                key={g}
                className={`tv-genre-pill ${activeGenre === g ? 'active' : ''}`}
                onClick={() => handleGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="tv-container">

          {activeGenre && (
            <ScrollRow
              title={`${activeGenre} Shows`}
              items={genreShows}
              loading={loading.genre}
            />
          )}

          {/* Currently Airing */}
          <ScrollRow title="Currently Airing" items={airing} loading={loading.airing} />

          {/* Popular */}
          <ScrollRow title="Popular TV Shows" items={popular} loading={loading.popular} />

          {/* Trending */}
          <ScrollRow title="Trending This Week" items={trending} loading={loading.trending} linkTo="/trending" />

          {/* Personalized */}
          {user && recommended.length > 0 && (
            <ScrollRow title="Picked for You" items={recommended} loading={loading.recommended} />
          )}

          {/* Top Rated */}
          <ScrollRow title="Highest Rated Shows" items={topRated} loading={loading.topRated} linkTo="/home?top_rated=true&type=tv_show" />

          {/* Wide card row - e.g. new shows */}
          <ScrollRow title="New &amp; Notable" items={popular.slice(0, 8)} loading={loading.popular} wide />

          {/* Browse by Genre */}
          <div className="tv-section">
            <div className="tv-section-header">
              <h2 className="tv-section-title">Browse by Genre</h2>
            </div>
            <div className="tv-genre-grid">
              {GENRES.map(g => {
                const [c1, c2] = GENRE_COLORS[g] || ['#111','#222'];
                return (
                  <button
                    key={g}
                    className="tv-genre-block"
                    onClick={() => handleGenre(g)}
                    style={{ border: 'none' }}
                  >
                    <div className="tv-genre-block-bg" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
                    <div className="tv-genre-block-label">{g}</div>
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