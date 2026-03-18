import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/catalog/')
      .then(response => setMovies(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>🍿 Currently Showing & Top Rated</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {movies.map(movie => (
          <div key={movie.media_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>{movie.title}</h3>
            <p>⭐ {movie.aggregate_rating} / 10</p>
            <p style={{ color: 'gray', fontSize: '14px' }}>Type: {movie.media_type}</p>
            <Link to={`/media/${movie.media_id}`} style={{ display: 'block', marginTop: '10px', color: 'blue' }}>
              View Details & Book
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;