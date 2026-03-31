import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Authcontext';
import Navbar from './navbar';
import Home from './Home';
import Login from './login';
import MovieDetail from './MovieDetail';
import MyBookings from './MyBookings';
// import Watchlist from './Watchlist';     // add when ready
// import Profile from './Profile';         // add when ready

// Route guard — redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Layout wraps every page that should show the navbar
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  const { login } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<Login onLogin={login} />}
      />

      {/* Pages with Navbar */}
      <Route
        path="/home"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/media/:id"
        element={
          <Layout>
            <MovieDetail />
          </Layout>
        }
      />

      {/* Protected pages with Navbar */}
      <Route
        path="/bookings"
        element={
          <PrivateRoute>
            <Layout>
              <MyBookings />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Add more protected routes here, e.g.:
      <Route
        path="/watchlist"
        element={
          <PrivateRoute>
            <Layout><Watchlist /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout><Profile /></Layout>
          </PrivateRoute>
        }
      />
      */}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}