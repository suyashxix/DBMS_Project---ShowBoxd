import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from './Authcontext';
import Sidebar from './Sidebar';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

  .nav-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #e8e4dc;
    font-family: 'DM Sans', sans-serif;
  }

  .nav-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  /* Hamburger */
  .nav-hamburger {
    width: 42px;
    height: 42px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    border: none;
    background: none;
    border-radius: 10px;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .nav-hamburger:hover { background: #f5f3ef; }
  .nav-hamburger span {
    display: block;
    width: 20px;
    height: 2px;
    background: #222;
    border-radius: 2px;
    transition: all 0.2s;
  }

  /* Logo */
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .nav-logo-icon {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, #1a1a1a, #333);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .nav-logo-icon svg {
    width: 20px;
    height: 20px;
    color: #d4a853;
  }
  .nav-logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 21px;
    color: #111;
    letter-spacing: -0.01em;
  }

  /* Nav links */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .nav-link {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #555;
    text-decoration: none;
    border: none;
    background: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .nav-link:hover { background: #f5f3ef; color: #111; }
  .nav-link.active { color: #111; background: #f0ede6; }

  /* Search bar */
  .nav-search {
    flex: 1;
    position: relative;
    max-width: 480px;
  }
  .nav-search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #999;
  }
  .nav-search-input {
    width: 100%;
    height: 42px;
    padding: 0 42px 0 44px;
    border: 1px solid #e4e0d8;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    background: #faf9f7;
    color: #111;
    outline: none;
    transition: all 0.2s;
  }
  .nav-search-input:focus {
    border-color: #111;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(17,17,17,0.06);
  }
  .nav-search-input::placeholder { color: #bbb; }
  .nav-search-clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: #ddd;
    color: #666;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    line-height: 1;
  }
  .nav-search-clear:hover { background: #ccc; }

  /* Right side */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    flex-shrink: 0;
  }

  /* Bookings link */
  .nav-bookings-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 10px;
    border: 1px solid #e4e0d8;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #444;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .nav-bookings-btn:hover {
    border-color: #d4a853;
    color: #111;
    background: #fffdf8;
    box-shadow: 0 2px 8px rgba(212,168,83,0.15);
  }
  .nav-bookings-btn svg {
    width: 18px;
    height: 18px;
    color: #d4a853;
  }

  /* Login button */
  .nav-login-btn {
    padding: 10px 22px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #1a1a1a, #333);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .nav-login-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  /* Avatar button */
  .nav-avatar-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #e4e0d8;
    background: linear-gradient(135deg, #1a1a1a, #333);
    color: #fff;
    font-family: 'DM Serif Display', serif;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
    position: relative;
  }
  .nav-avatar-btn:hover {
    border-color: #d4a853;
    transform: scale(1.05);
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  }

  /* Dropdown */
  .nav-dropdown-wrap {
    position: relative;
  }
  .nav-dropdown {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    background: #fff;
    border: 1px solid #e8e4dc;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    min-width: 240px;
    overflow: hidden;
    z-index: 300;
    animation: nav-dd-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: top right;
  }
  @keyframes nav-dd-in {
    from { opacity: 0; transform: scale(0.95) translateY(-8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .nav-dd-header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid #f0ede8;
    background: linear-gradient(to bottom, #faf9f7, #fff);
  }
  .nav-dd-name {
    font-size: 15px;
    font-weight: 600;
    color: #111;
  }
  .nav-dd-email {
    font-size: 13px;
    color: #888;
    margin-top: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .nav-dd-items { padding: 8px 0; }
  .nav-dd-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #444;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    text-decoration: none;
    transition: all 0.12s;
  }
  .nav-dd-item:hover { background: #f8f6f2; color: #111; }
  .nav-dd-item.danger { color: #c0392b; }
  .nav-dd-item.danger:hover { background: #fef5f5; color: #a02920; }
  .nav-dd-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
  }
  .nav-dd-item:hover .nav-dd-icon { color: #555; }
  .nav-dd-item.danger .nav-dd-icon { color: #c0392b; }
  .nav-dd-divider { height: 1px; background: #f0ede8; margin: 6px 0; }

  /* Mobile */
  @media (max-width: 900px) {
    .nav-links { display: none; }
    .nav-bookings-btn span { display: none; }
    .nav-bookings-btn { padding: 9px 12px; }
  }
  @media (max-width: 640px) {
    .nav-inner { gap: 12px; padding: 0 16px; height: 58px; }
    .nav-logo-text { display: none; }
    .nav-search { max-width: none; }
    .nav-bookings-btn { display: none; }
  }
`;

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilmIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
  </svg>
);

const TicketIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 104 0V7a2 2 0 00-2-2zm0 0h14a2 2 0 012 2v3a2 2 0 11-4 0V7m4 0a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2" />
  </svg>
);

const UserIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const ClockIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) { navigate('/home'); return; }
    navigate(`/home?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <style>{styles}</style>
      <div className="nav-root">
        <nav className="nav-bar">
          <div className="nav-inner">
            <button className="nav-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>

            <Link to="/home" className="nav-logo">
              <div className="nav-logo-icon">
                <FilmIcon />
              </div>
              <span className="nav-logo-text">Cinelog</span>
            </Link>

            <div className="nav-links">
              <Link to="/home?type=movie" className="nav-link">Movies</Link>
              <Link to="/home?type=tv_show" className="nav-link">TV Shows</Link>
              <Link to="/showtimes" className="nav-link">Showtimes</Link>
              <Link to="/trending" className="nav-link">Trending</Link>
            </div>

            <form className="nav-search" onSubmit={handleSearch}>
              <span className="nav-search-icon"><SearchIcon /></span>
              <input
                className="nav-search-input"
                type="text"
                placeholder="Search movies, shows, actors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="nav-search-clear"
                  onClick={() => { setSearchQuery(''); navigate('/home'); }}
                >
                  x
                </button>
              )}
            </form>

            <div className="nav-right">
              {user ? (
                <>
                  <Link to="/bookings" className="nav-bookings-btn">
                    <TicketIcon />
                    <span>My Bookings</span>
                  </Link>

                  <div className="nav-dropdown-wrap" ref={dropdownRef}>
                    <button
                      className="nav-avatar-btn"
                      onClick={() => setDropdownOpen(o => !o)}
                      aria-label="Profile menu"
                    >
                      {initials}
                    </button>

                    {dropdownOpen && (
                      <div className="nav-dropdown">
                        <div className="nav-dd-header">
                          <div className="nav-dd-name">{user.name}</div>
                          <div className="nav-dd-email">{user.email || 'Signed in'}</div>
                        </div>

                        <div className="nav-dd-items">
                          <Link to="/profile" className="nav-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nav-dd-icon"><UserIcon /></span> Profile
                          </Link>
                          <Link to="/watchlist" className="nav-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nav-dd-icon"><BookmarkIcon /></span> My Watchlist
                          </Link>
                          <Link to="/bookings" className="nav-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nav-dd-icon"><TicketIcon /></span> My Bookings
                          </Link>
                          <Link to="/history" className="nav-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nav-dd-icon"><ClockIcon /></span> Watch History
                          </Link>

                          <div className="nav-dd-divider" />

                          <Link to="/settings" className="nav-dd-item" onClick={() => setDropdownOpen(false)}>
                            <span className="nav-dd-icon"><SettingsIcon /></span> Settings
                          </Link>

                          <div className="nav-dd-divider" />

                          <button className="nav-dd-item danger" onClick={handleLogout}>
                            <span className="nav-dd-icon"><LogoutIcon /></span> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login" className="nav-login-btn">Sign In</Link>
              )}
            </div>
          </div>
        </nav>
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
