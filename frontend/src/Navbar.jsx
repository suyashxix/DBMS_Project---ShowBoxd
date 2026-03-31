import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from './Authcontext';
import Sidebar from './Sidebar';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .nav-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    border-bottom: 1px solid #e4e0d8;
    box-shadow: 0 1px 12px rgba(0,0,0,0.05);
    font-family: 'DM Sans', sans-serif;
  }

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 58px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* Hamburger */
  .nav-hamburger {
    width: 38px;
    height: 38px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    border: none;
    background: none;
    border-radius: 8px;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .nav-hamburger:hover { background: #f5f3ef; }
  .nav-hamburger span {
    display: block;
    width: 18px;
    height: 2px;
    background: #111;
    border-radius: 2px;
    transition: all 0.2s;
  }

  /* Logo */
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .nav-logo-icon {
    width: 34px;
    height: 34px;
    background: #111;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .nav-logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 19px;
    color: #111;
    letter-spacing: -0.01em;
  }

  /* Nav links */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }
  .nav-link {
    padding: 6px 12px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    text-decoration: none;
    border: none;
    background: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.12s;
    white-space: nowrap;
  }
  .nav-link:hover { background: #f5f3ef; color: #111; }
  .nav-link.active { color: #111; background: #f5f3ef; }

  /* Search bar */
  .nav-search {
    flex: 1;
    position: relative;
    max-width: 420px;
  }
  .nav-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    pointer-events: none;
    color: #bbb;
  }
  .nav-search-input {
    width: 100%;
    height: 36px;
    padding: 0 36px 0 36px;
    border: 1px solid #e0ddd6;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    background: #faf9f7;
    color: #111;
    outline: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }
  .nav-search-input:focus {
    border-color: #111;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(17,17,17,0.05);
  }
  .nav-search-input::placeholder { color: #ccc; }
  .nav-search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: none;
    background: #ddd;
    color: #666;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.12s;
    line-height: 1;
  }
  .nav-search-clear:hover { background: #ccc; }

  /* Right side */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    flex-shrink: 0;
  }

  /* Bookings link */
  .nav-bookings-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    border: 1px solid #e4e0d8;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #555;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.12s;
    white-space: nowrap;
  }
  .nav-bookings-btn:hover { border-color: #111; color: #111; background: #f9f8f6; }

  /* Login button */
  .nav-login-btn {
    padding: 7px 16px;
    border-radius: 8px;
    border: none;
    background: #111;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .nav-login-btn:hover { opacity: 0.85; }

  /* Avatar button */
  .nav-avatar-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #e4e0d8;
    background: #111;
    color: #fff;
    font-family: 'DM Serif Display', serif;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, transform 0.15s;
    flex-shrink: 0;
    position: relative;
  }
  .nav-avatar-btn:hover { border-color: #111; transform: scale(1.05); }

  /* Dropdown */
  .nav-dropdown-wrap {
    position: relative;
  }
  .nav-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 13px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    min-width: 210px;
    overflow: hidden;
    z-index: 300;
    animation: nav-dd-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: top right;
  }
  @keyframes nav-dd-in {
    from { opacity: 0; transform: scale(0.94) translateY(-6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .nav-dd-header {
    padding: 14px 16px 10px;
    border-bottom: 1px solid #f0ede8;
  }
  .nav-dd-name {
    font-size: 14px;
    font-weight: 500;
    color: #111;
  }
  .nav-dd-email {
    font-size: 12px;
    color: #aaa;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 178px;
  }

  .nav-dd-items { padding: 6px 0; }
  .nav-dd-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    text-decoration: none;
    transition: all 0.1s;
  }
  .nav-dd-item:hover { background: #f5f3ef; color: #111; }
  .nav-dd-item.danger { color: #c0392b; }
  .nav-dd-item.danger:hover { background: #fef0f0; color: #922b21; }
  .nav-dd-icon { font-size: 15px; width: 18px; text-align: center; }
  .nav-dd-divider { height: 1px; background: #f0ede8; margin: 4px 0; }

  /* Mobile hidden labels */
  @media (max-width: 700px) {
    .nav-links { display: none; }
    .nav-bookings-btn { display: none; }
    .nav-logo-text { display: none; }
    .nav-search { max-width: none; }
  }
  @media (max-width: 480px) {
    .nav-inner { gap: 10px; padding: 0 14px; }
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState(searchParams.get('q') || '');

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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

            {/* Hamburger */}
            <button className="nav-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>

            {/* Logo */}
            <Link to="/home" className="nav-logo">
              <div className="nav-logo-icon">🎬</div>
              <span className="nav-logo-text">Cinélog</span>
            </Link>

            {/* Nav links */}
            <div className="nav-links">
              <Link to="/home?type=movie" className="nav-link">Movies</Link>
              <Link to="/home?type=tv_show" className="nav-link">TV Shows</Link>
              <Link to="/trending" className="nav-link">Trending</Link>
            </div>

            {/* Search */}
            <form className="nav-search" onSubmit={handleSearch}>
              <span className="nav-search-icon">🔍</span>
              <input
                className="nav-search-input"
                type="text"
                placeholder="Search movies, shows…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="nav-search-clear"
                  onClick={() => { setSearchQuery(''); navigate('/home'); }}
                >
                  ✕
                </button>
              )}
            </form>

            {/* Right */}
            <div className="nav-right">
              {user ? (
                <>
                  <Link to="/bookings" className="nav-bookings-btn">
                    🎟 My Bookings
                  </Link>

                  {/* Profile dropdown */}
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
                          <Link
                            to="/profile"
                            className="nav-dd-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="nav-dd-icon">👤</span> Profile
                          </Link>
                          <Link
                            to="/watchlist"
                            className="nav-dd-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="nav-dd-icon">📋</span> My Watchlist
                          </Link>
                          <Link
                            to="/bookings"
                            className="nav-dd-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="nav-dd-icon">🎟</span> My Bookings
                          </Link>
                          <Link
                            to="/history"
                            className="nav-dd-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="nav-dd-icon">🕐</span> Watch History
                          </Link>

                          <div className="nav-dd-divider" />

                          <Link
                            to="/settings"
                            className="nav-dd-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span className="nav-dd-icon">⚙️</span> Settings
                          </Link>

                          <div className="nav-dd-divider" />

                          <button className="nav-dd-item danger" onClick={handleLogout}>
                            <span className="nav-dd-icon">↩</span> Sign Out
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

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}