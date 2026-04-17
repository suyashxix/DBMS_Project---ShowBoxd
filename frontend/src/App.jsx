import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Authcontext';
import Navbar from './Navbar';
import Home from './Home';
import Login from './login';
import MediaDetail from './MediaDetail';
import AllReviews from './AllReviews';
import MyBookings from './MyBookings';
import Trending from './Trending';
import Watchlist from './Watchlist';
import WatchHistory from './WatchHistory';
import AwardWinners from './AwardWinners';
import NowShowing from './NowShowing';
import ComingSoon from './ComingSoon';
import CommunityPicks from './CommunityPicks';
import MoviesPage  from './MoviesPage';
import TVShowsPage from './TVShowsPage';
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
            <Route path="/movies"   element={<MoviesPage />} />
            <Route path="/tv-shows" element={<TVShowsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Layout><Home /></Layout>} />
            <Route path="/trending" element={<Layout><Trending /></Layout>} />
            <Route path="/media/:id" element={<Layout><MediaDetail /></Layout>} />
            <Route path="/media/:id/reviews" element={<Layout><AllReviews /></Layout>} />
            <Route path="/bookings" element={<Layout><MyBookings /></Layout>} />
            <Route path="/watchlist" element={<Layout><Watchlist /></Layout>} />
            <Route path="/history" element={<Layout><WatchHistory /></Layout>} />
            <Route path="/winners" element={<Layout><AwardWinners /></Layout>} />
            <Route path="/now-showing" element={<Layout><NowShowing /></Layout>} />
            <Route path="/coming-soon" element={<Layout><ComingSoon /></Layout>} />
            <Route path="/community" element={<Layout><CommunityPicks /></Layout>} />
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