import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    signup(name, email, password);
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join the railway intelligence platform</p>

        {error && (
          <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', padding: '8px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            id="signup-name"
          />
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            id="signup-email"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            id="signup-password"
          />
          <button className="auth-btn" type="submit" id="signup-submit">
            Create Account
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
