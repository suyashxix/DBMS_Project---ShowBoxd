import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MovieDetail from './MovieDetail';
import TVShowDetail from './TVShowDetail';

const API = 'http://127.0.0.1:8000';

function MediaDetail() {
  const { id } = useParams();
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch media to determine type
    axios
      .get(`${API}/api/media/${id}/`)
      .then((res) => {
        setMediaType(res.data.details.media_type);
      })
      .catch((error) => {
        console.error('Error fetching media type:', error);
        setMediaType('movie'); // Default to movie on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontFamily: 'DM Sans, sans-serif',
        color: '#888'
      }}>
        Loading...
      </div>
    );
  }

  // Route to appropriate component based on media type
  if (mediaType === 'tv_show') {
    return <TVShowDetail />;
  }

  return <MovieDetail />;
}

export default MediaDetail;