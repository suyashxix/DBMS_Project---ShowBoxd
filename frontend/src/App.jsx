import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import MovieDetail from './MovieDetail';
import MyBookings from './Mybookings';


function App() {
  return (
    <Router>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f3ef', minHeight: '100vh' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px', background: '#111', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', fontWeight: 400, textDecoration: 'none', color: '#e50914', letterSpacing: '-0.3px' }}>
            ShowBoxd
          </Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Browse</Link>
            <Link to="/bookings" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>My Bookings</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/media/:id" element={<MovieDetail />} />
          <Route path="/bookings"  element={<MyBookings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;