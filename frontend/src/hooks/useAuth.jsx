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

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects 'username'
    formData.append('password', password);

    const res = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('rg-token', data.access_token);
    
    // Fetch profile
    const userRes = await fetch('http://localhost:8000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    });
    const userData = await userRes.json();
    
    const u = { ...userData, role: 'Operator' };
    setUser(u);
    return u;
  };

  const signup = async (name, email, password) => {
    const res = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Signup failed');
    }

    // Auto login
    const userObj = await login(email, password);
    // Persist the name collected during signup to the profile
    updateProfile({ name });
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('rg-token');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('rg-token');
      const res = await fetch('http://localhost:8000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser({ ...updatedUser, role: 'Operator' });
      } else {
        setUser({ ...user, ...updates });
      }
    } catch (e) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
