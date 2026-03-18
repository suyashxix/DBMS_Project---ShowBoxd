import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import MovieDetail from './MovieDetail';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #ccc' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#e50914' }}>
            🎬 ShowBoxd (DBMS Project)
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/media/:id" element={<MovieDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;