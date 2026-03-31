import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Authcontext';
import Navbar from './navbar';
import Home from './Home';
import Login from './login';
import MovieDetail from './MovieDetail';
import MyBookings from './MyBookings';
import Trending from './Trending';
import Watchlist from './Watchlist';
import WatchHistory from './WatchHistory';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home"     element={<Layout><Home /></Layout>} />
      <Route path="/trending" element={<Layout><Trending /></Layout>} />
      <Route path="/media/:id" element={<Layout><MovieDetail /></Layout>} />
      <Route path="/bookings"  element={<Layout><MyBookings /></Layout>} />
      <Route path="/watchlist" element={<Layout><Watchlist /></Layout>} />
      <Route path="/history"   element={<Layout><WatchHistory /></Layout>} />
      {/* <Route path="/profile"  element={<Layout><Profile /></Layout>} /> */}
      {/* <Route path="/settings" element={<Layout><Settings /></Layout>} /> */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
return (
    <AuthProvider>
      <BrowserRouter>
          <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}