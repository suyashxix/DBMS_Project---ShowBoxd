import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Rehydrate from localStorage on first load
    const token = localStorage.getItem('token');
    const user_id = localStorage.getItem('user_id');
    const name = localStorage.getItem('user_name');
    const role = localStorage.getItem('role');
    if (token && user_id) return { token, user_id: Number(user_id), name, role };
    return null;
  });

  const login = useCallback((userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user_id', String(userData.user_id));
    localStorage.setItem('user_name', userData.name);
    localStorage.setItem('role', userData.role ?? 'user');
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('role');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}