import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AnimatedRouteWrapper from './AnimatedRouteWrapper';
import ProductTour from '../common/ProductTour';
import { useDemoMode } from '../../hooks/useDemoMode';
import { useAuth } from '../../hooks/useAuth';

const pageTitles = {
  '/app':              'Dashboard',
  '/app/network-map':  'Network Map',
  '/app/fleet-triage': 'Fleet Triage',
  '/app/reallocation': 'AI Reallocation',
  '/app/track-health': 'Track Health',
  '/app/forward-vision': 'Forward Vision',
  '/app/settings': 'Account Settings',
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isDemoMode } = useDemoMode();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const title = pageTitles[location.pathname] || 'RailGuard AI';

  return (
    <div className="app-shell">
      <ProductTour />
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggle={() => setCollapsed(c => !c)} closeMobile={() => setMobileOpen(false)} />
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)}></div>}
      <div className={`main-area${collapsed ? ' collapsed' : ''}`}>
        <Header collapsed={collapsed} title={title} onMobileMenuClick={() => setMobileOpen(true)} />
        <div className="page-wrap">
          <AnimatedRouteWrapper>
            <Outlet />
          </AnimatedRouteWrapper>
        </div>
      </div>
      {isDemoMode && (
        <div className={`demo-banner-bar${collapsed ? ' collapsed' : ''}`}>
          📡 Demo Mode — Showing cached data (backend unreachable)
        </div>
      )}
    </div>
  );
}
