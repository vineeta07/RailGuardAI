import { useState, useEffect } from 'react';
import { Bell, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useDemoMode } from '../../hooks/useDemoMode';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ collapsed, title }) {
  const { theme, toggle: toggleTheme } = useTheme();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const [clock, setClock] = useState('');

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const statusLabel = isDemoMode ? 'Demo' : 'Live';
  const statusClass = isDemoMode ? 'demo' : 'online';

  return (
    <header className={`header${collapsed ? ' collapsed' : ''}`} id="app-header">
      <div className="header-left">
        <span className="header-page-title">{title || 'Overview'}</span>
      </div>

      <div className="header-right">
        {/* Clock */}
        <div className="header-clock" id="live-clock">{clock}</div>

        {/* System Status */}
        <button
          className={`header-pill ${statusClass}`}
          onClick={toggleDemoMode}
          title="Toggle Demo Mode"
          id="system-status-pill"
        >
          <span className="pill-dot" />
          {statusLabel}
        </button>

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode" id="theme-toggle">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
          <Globe size={14} style={{ color: 'var(--text-muted)' }}/>
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="en">Eng</option>
            <option value="hi">हिंदी</option>
            <option value="bn">বাংলা</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="header-notif" id="notif-bell">
          <Bell size={16} />
          <span className="header-notif-badge">3</span>
        </button>

        {/* User */}
        {user && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={logout}
            style={{ marginLeft: 4 }}
            id="logout-btn"
          >
            {user.name}
          </button>
        )}
      </div>
    </header>
  );
}
