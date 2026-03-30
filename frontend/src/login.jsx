import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .auth-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-wrap {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #f5f3ef;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle background decoration */
  .auth-wrap::before {
    content: '';
    position: fixed;
    top: -120px;
    right: -120px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(26,107,60,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-wrap::after {
    content: '';
    position: fixed;
    bottom: -100px;
    left: -100px;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(17,17,17,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Card */
  .auth-card {
    background: #fff;
    border: 1px solid #e4e0d8;
    border-radius: 20px;
    width: 100%;
    max-width: 420px;
    padding: 44px 40px 40px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.07);
    position: relative;
    z-index: 1;
    animation: auth-slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes auth-slide-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Brand mark */
  .auth-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
  }
  .auth-brand-icon {
    width: 38px;
    height: 38px;
    background: #111;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .auth-brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #111;
    letter-spacing: -0.01em;
  }

  /* Toggle tabs */
  .auth-tabs {
    display: flex;
    background: #f5f3ef;
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 28px;
    gap: 2px;
  }
  .auth-tab {
    flex: 1;
    padding: 9px 0;
    border: none;
    border-radius: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    background: transparent;
    color: #999;
  }
  .auth-tab.active {
    background: #fff;
    color: #111;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }

  /* Heading */
  .auth-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    font-weight: 400;
    color: #111;
    line-height: 1.2;
    margin-bottom: 6px;
    animation: auth-fade-in 0.3s ease both;
  }
  .auth-heading em {
    font-style: italic;
    color: #1a6b3c;
  }
  .auth-sub {
    font-size: 13px;
    color: #999;
    margin-bottom: 28px;
    animation: auth-fade-in 0.3s 0.05s ease both;
  }

  @keyframes auth-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Form fields */
  .auth-field {
    margin-bottom: 14px;
    animation: auth-fade-in 0.3s ease both;
  }
  .auth-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #888;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .auth-input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #e0ddd6;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    background: #faf9f7;
    color: #111;
    outline: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }
  .auth-input:focus {
    border-color: #111;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(17,17,17,0.06);
  }
  .auth-input::placeholder { color: #ccc; }

  /* Two-col row */
  .auth-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Submit button */
  .auth-btn {
    width: 100%;
    padding: 13px;
    margin-top: 8px;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.12s;
    position: relative;
    overflow: hidden;
  }
  .auth-btn:hover:not(:disabled) { opacity: 0.88; }
  .auth-btn:active:not(:disabled) { transform: scale(0.99); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Shimmer on button */
  .auth-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  .auth-btn:hover:not(:disabled)::after { transform: translateX(100%); }

  /* Error / success */
  .auth-alert {
    padding: 11px 14px;
    border-radius: 9px;
    font-size: 13px;
    margin-bottom: 16px;
    animation: auth-fade-in 0.2s ease both;
  }
  .auth-alert-error   { background: #fef0f0; color: #c0392b; border: 1px solid #f5c6c6; }
  .auth-alert-success { background: #edf7f0; color: #1a6b3c; border: 1px solid #b7dfc6; }

  /* Divider */
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0 0;
  }
  .auth-divider-line { flex: 1; height: 1px; background: #e4e0d8; }
  .auth-divider-text { font-size: 12px; color: #bbb; white-space: nowrap; }

  /* Switch link */
  .auth-switch {
    text-align: center;
    font-size: 13px;
    color: #999;
    margin-top: 14px;
  }
  .auth-switch button {
    background: none;
    border: none;
    color: #111;
    font-weight: 500;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* Loading spinner inside button */
  .auth-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: auth-spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
  @keyframes auth-spin { to { transform: rotate(360deg); } }

  /* Field animation delays */
  .auth-field:nth-child(1) { animation-delay: 0.05s; }
  .auth-field:nth-child(2) { animation-delay: 0.1s; }
  .auth-field:nth-child(3) { animation-delay: 0.15s; }
  .auth-field:nth-child(4) { animation-delay: 0.2s; }
  .auth-field:nth-child(5) { animation-delay: 0.25s; }

  @media (max-width: 480px) {
    .auth-card { padding: 32px 24px 28px; }
    .auth-row  { grid-template-columns: 1fr; }
  }
`;

const REGIONS = ['IN', 'US', 'UK', 'CA', 'AU', 'SG', 'AE', 'Other'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'French', 'Spanish', 'German', 'Other'];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login fields
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name,     setName]     = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass,  setRegPass]  = useState('');
  const [region,   setRegion]   = useState('IN');
  const [lang,     setLang]     = useState('');

  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState(null); // { type: 'error'|'success', msg }

  const switchMode = (m) => {
    setMode(m);
    setAlert(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const res = await axios.post(`${API}/api/auth/login/`, { email, password });
      const { token, user_id, name: userName, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('user_name', userName);
      localStorage.setItem('role', role);
      setAlert({ type: 'success', msg: `Welcome back, ${userName}!` });
      if (onLogin) onLogin({ token, user_id, name: userName, role });
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.error || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const res = await axios.post(`${API}/api/auth/register/`, {
        name,
        email: regEmail,
        password: regPass,
        region,
        preferred_language: lang || null,
      });
      const { token, user_id } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('user_name', name);
      setAlert({ type: 'success', msg: 'Account created! Redirecting…' });
      if (onLogin) onLogin({ token, user_id, name });
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.error || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-wrap">
        <div className="auth-card">

          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">🎬</div>
            <span className="auth-brand-name">Cinélog</span>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
              Sign In
            </button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>
              Create Account
            </button>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`auth-alert auth-alert-${alert.type}`}>
              {alert.type === 'error' ? '⚠ ' : '✓ '}{alert.msg}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <h1 className="auth-heading">Welcome <em>back.</em></h1>
              <p className="auth-sub">Sign in to your account to continue.</p>

              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading && <span className="auth-spinner" />}
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">don't have an account?</span>
                <div className="auth-divider-line" />
              </div>
              <div className="auth-switch">
                <button onClick={() => switchMode('register')}>Create one for free</button>
              </div>
            </>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <>
              <h1 className="auth-heading">Start <em>watching.</em></h1>
              <p className="auth-sub">Create your free account in seconds.</p>

              <form onSubmit={handleRegister}>
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Choose a strong password"
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-row">
                  <div className="auth-field">
                    <label className="auth-label">Region</label>
                    <select
                      className="auth-input"
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                      required
                      style={{ cursor: 'pointer' }}
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Language <span style={{ color: '#ccc', fontWeight: 400 }}>(opt.)</span></label>
                    <select
                      className="auth-input"
                      value={lang}
                      onChange={e => setLang(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Any</option>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading && <span className="auth-spinner" />}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">already have an account?</span>
                <div className="auth-divider-line" />
              </div>
              <div className="auth-switch">
                <button onClick={() => switchMode('login')}>Sign in instead</button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}