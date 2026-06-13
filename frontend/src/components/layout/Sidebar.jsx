import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Train, Activity,
  HeartPulse, Eye, Leaf, Settings
} from 'lucide-react';

const navItems = [
  { label: 'Overview', to: '/',              icon: LayoutDashboard, section: 'Main' },
  { label: 'Digital Twin',  to: '/digital-twin', icon: Map,             section: 'Main' },
  { label: 'Rake Fleet',    to: '/rakes',        icon: Train,           section: 'Modules' },
  { label: 'Track Health',  to: '/track-health',  icon: Activity,        section: 'Modules' },
  { label: 'Rolling Stock', to: '/rolling-stock', icon: HeartPulse,      section: 'Modules' },
  { label: 'Forward Vision', to: '/forward-vision', icon: Eye,           section: 'Modules' },
  { label: 'Sustainability', to: '/sustainability', icon: Leaf,          section: 'Impact' },
];

export default function Sidebar() {
  const location = useLocation();
  let currentSection = '';

  return (
    <nav className="sidebar" id="sidebar-nav">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚂</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">RailGuard AI</span>
          <span className="sidebar-logo-subtitle">Intelligence Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {navItems.map((item) => {
          const showSection = item.section !== currentSection;
          if (showSection) currentSection = item.section;
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <div key={item.to}>
              {showSection && (
                <div className="sidebar-section-label">{item.section}</div>
              )}
              <NavLink
                to={item.to}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                id={`nav-${item.to.replace('/', '') || 'dashboard'}`}
              >
                <Icon className="sidebar-link-icon" size={18} />
                {item.label}
              </NavLink>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
