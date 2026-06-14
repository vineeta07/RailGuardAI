import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Map, Wrench, Brain,
  Activity, Eye, ChevronLeft, ChevronRight, Train, LogOut, Settings, MoreHorizontal
} from 'lucide-react';

const sections = [
  {
    label: 'Command',
    items: [
      { label: 'Dashboard', to: '/app', icon: LayoutDashboard },
      { label: 'Network Map', to: '/app/network-map', icon: Map },
    ],
  },
  {
    label: 'Modules',
    items: [
      { label: 'Fleet Triage', to: '/app/fleet-triage', icon: Wrench },
      { label: 'Reallocation', to: '/app/reallocation', icon: Brain },
      { label: 'Track Health', to: '/app/track-health', icon: Activity },
      { label: 'Forward Vision', to: '/app/forward-vision', icon: Eye },
    ],
  },
  {
    label: 'Preferences',
    items: [
      { label: 'Settings', to: '/app/settings', icon: Settings }
    ]
  }
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`} id="sidebar">
      {/* Collapse toggle */}
      <button className="sidebar-collapse-btn" onClick={onToggle} title="Toggle sidebar">
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <Link to="/app" className="sidebar-top" style={{ padding: 0, minHeight: 75, borderBottom: 'none', overflow: 'visible', justifyContent: collapsed ? 'center' : 'flex-start', textDecoration: 'none', color: 'inherit' }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            width: collapsed ? 54 : 110, 
            height: collapsed ? 54 : 110, 
            background: 'transparent', 
            objectFit: 'contain', 
            flexShrink: 0, 
            marginLeft: collapsed ? 0 : -10,
            transition: 'all 0.3s ease'
          }} 
        />
        {!collapsed && <div className="sidebar-brand" style={{ fontSize: '18px', marginLeft: '-20px', zIndex: 10 }}>Rail<span>Guard </span>AI</div>}
      </Link>

      {/* Navigation */}
      <div className="sidebar-nav" style={{ paddingTop: 0, marginTop: -20 }}>
        {sections.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-label">{t(section.label)}</div>
            {section.items.map((item) => {
              const Icon = item.icon;

              const isActive = item.to === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  id={`nav-${item.to.replace('/app/', '').replace('/app', 'overview') || 'overview'}`}
                  end={item.to === '/app'}
                >
                  <Icon className="nav-icon" size={18} />
                  <span className="nav-text">{t(item.label)}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Logout at bottom */}
      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
        <button 
          className="btn btn-ghost" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start', padding: '8px 12px', color: 'var(--danger)' }}
          onClick={logout}
        >
          <LogOut size={18} />
          {!collapsed && <span style={{ fontWeight: 500 }}>Log Out</span>}
        </button>
      </div>
    </nav>
  );
}
