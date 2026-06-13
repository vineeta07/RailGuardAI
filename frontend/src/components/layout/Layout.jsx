import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DemoModeBanner from '../common/DemoModeBanner';
import NetworkStatus from '../common/NetworkStatus';
import { useDemoMode } from '../../hooks/useDemoMode';

const pageTitles = {
  '/':               'Dashboard',
  '/digital-twin':   'Digital Twin',
  '/rakes':          'Rake Fleet Management',
  '/track-health':   'Track Health Monitor',
  '/rolling-stock':  'Rolling Stock Health',
  '/forward-vision': 'Forward Vision Safety',
  '/sustainability': 'Sustainability Impact',
};

export default function Layout() {
  const location = useLocation();
  const { isDemoMode } = useDemoMode();
  const title = pageTitles[location.pathname] || 'RailGuard AI';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Header title={title} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      {isDemoMode && <DemoModeBanner />}
      <NetworkStatus />
    </div>
  );
}
