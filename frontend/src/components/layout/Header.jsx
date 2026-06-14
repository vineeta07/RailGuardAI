import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sun, Moon, Globe, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useDemoMode } from '../../hooks/useDemoMode';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ collapsed, title, onMobileMenuClick }) {
  const { theme, toggle: toggleTheme } = useTheme();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const [clock, setClock] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);

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
        <button className="mobile-menu-btn" onClick={onMobileMenuClick} aria-label="Open Menu">
          <Menu size={20} />
        </button>
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
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            <option value="en" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Eng</option>
            <option value="hi" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>हिंदी</option>
            <option value="bn" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>বাংলা</option>
            <option value="ta" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>தமிழ்</option>
          </select>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            className="header-notif" 
            id="notif-bell" 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ cursor: 'pointer' }}
          >
            <Bell size={16} />
            <span className="header-notif-badge">2</span>
          </button>

          {showNotifs && (
            <div 
              style={{
                position: 'absolute', top: 'calc(100% + 12px)', right: -60,
                width: 320, background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: 'var(--accent)' }} onClick={() => setShowNotifs(false)}>Mark all read</button>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>High Risk on Track Section</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Track alignment deviation detected on Mumbai-Surat sector. Immediate inspection required.</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>12 mins ago</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Maintenance Alert: RAKE-4022</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Brake pressure anomaly detected. Schedule maintenance within 48h.</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>2 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost" style={{ fontSize: 12, width: '100%' }}>View All</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        {user && (
          <Link
            to="/app/settings"
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 6px', borderRadius: '24px', background: 'var(--bg-card)', textDecoration: 'none', color: 'inherit' }}
            title="Profile Settings"
          >
            {user.profilePic ? (
              <img src={user.profilePic} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name || 'User'}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
