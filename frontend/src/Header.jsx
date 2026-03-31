import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Authcontext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');

  .header-wrap {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e4e0d8;
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #111;
  }

  .header-brand-icon {
    width: 32px;
    height: 32px;
    background: #111;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .header-brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    letter-spacing: -0.01em;
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .header-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #666;
    text-decoration: none;
    transition: color 0.15s;
  }

  .header-link:hover {
    color: #111;
  }

  .header-link.active {
    color: #111;
    font-weight: 500;
  }

  .header-user {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-user-name {
    font-size: 14px;
    color: #111;
    font-weight: 500;
  }

  .header-user-badge {
    font-size: 11px;
    background: #f0ede7;
    color: #666;
    padding: 3px 8px;
    border-radius: 10px;
    font-weight: 500;
  }

  .header-logout {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    background: #f5f3ef;
    color: #666;
    border: 1px solid #e4e0d8;
    border-radius: 8px;
    padding: 6px 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .header-logout:hover {
    background: #fff;
    color: #111;
    border-color: #111;
  }

  @media (max-width: 640px) {
    .header-nav {
      gap: 12px;
    }
    .header-link {
      font-size: 13px;
    }
    .header-user-name {
      display: none;
    }
  }
`;

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="header-wrap">
        <div className="header-container">
          <Link to="/home" className="header-brand">
            <div className="header-brand-icon">🎬</div>
            <span className="header-brand-name">ShowBoxd</span>
          </Link>

          <nav className="header-nav">
            <Link to="/home" className="header-link">
              Browse
            </Link>
            <Link to="/bookings" className="header-link">
              My Bookings
            </Link>

            <div className="header-user">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="header-user-name">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="header-user-badge">Admin</span>
                )}
              </div>
              <button className="header-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}