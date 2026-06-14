import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    login(email, password);
    navigate('/app');
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-logo">
          <div className="sidebar-logo"><Train size={16} /></div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Rail<span style={{ color: 'var(--accent)' }}>Guard</span> AI</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to access the command center</p>

        {error && (
          <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', padding: '8px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            id="login-email"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            id="login-password"
          />
          <button className="auth-btn" type="submit" id="login-submit">
            Sign In
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
