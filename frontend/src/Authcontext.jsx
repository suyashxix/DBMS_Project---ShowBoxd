import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const user_id = localStorage.getItem('user_id');
      const user_name = localStorage.getItem('user_name');
      const role = localStorage.getItem('role');

      if (token && user_id) {
        setUser({
          token,
          user_id: parseInt(user_id),
          name: user_name,
          role: role || 'user'
        });
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    const { token, user_id, name, role } = userData;

    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', user_id);
    localStorage.setItem('user_name', name);
    localStorage.setItem('role', role || 'user');

    // Update context state
    setUser({
      token,
      user_id: parseInt(user_id),
      name,
      role: role || 'user'
    });
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('role');

    // Clear context state
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};