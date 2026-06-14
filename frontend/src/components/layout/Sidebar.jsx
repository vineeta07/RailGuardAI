import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Map, Wrench, Brain,
  Activity, Eye, ChevronLeft, ChevronRight, Train, LogOut
} from 'lucide-react';

const sections = [
  {
    label: 'Command',
    items: [
      { label: 'Overview', to: '/app', icon: LayoutDashboard },
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
      <div className="sidebar-top">
        <div className="sidebar-logo"><Train size={16} /></div>
        <div className="sidebar-brand">Rail<span>Guard</span> AI</div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
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

      {/* Footer */}
      <div className="sidebar-footer" style={{ padding: '16px' }}>
        <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <LogOut size={14} /> {t('Log Out')}
        </button>
      </div>
    </nav>
  );
}
