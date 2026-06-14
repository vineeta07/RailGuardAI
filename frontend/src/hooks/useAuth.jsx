import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rg-user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('rg-user', JSON.stringify(user));
    else localStorage.removeItem('rg-user');
  }, [user]);

  const login = (email, password) => {
    // Simulated auth for hackathon — always succeeds
    const u = { email, name: email.split('@')[0], role: 'Operator' };
    setUser(u);
    return u;
  };

  const signup = (name, email, password) => {
    const u = { email, name, role: 'Operator' };
    setUser(u);
    return u;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
