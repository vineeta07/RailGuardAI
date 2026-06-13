import { useDemoMode } from '../../hooks/useDemoMode';
import { useNativeFeatures } from '../../hooks/useNativeFeatures';
import { Wifi, WifiOff, Radio } from 'lucide-react';

export default function Header({ title }) {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { isOnline } = useNativeFeatures();

  return (
    <header className="header" id="app-header">
      <div className="header-left">
        <h1 className="header-title">{title || 'Dashboard'}</h1>
      </div>

      <div className="header-right">
        {/* Connection Status */}
        <div className="header-status" id="connection-status">
          <span className={`header-status-dot ${!isOnline ? 'offline' : isDemoMode ? 'demo' : ''}`} />
          {!isOnline ? 'Offline' : isDemoMode ? 'Demo Mode' : 'Live'}
        </div>

        {/* Demo Mode Toggle */}
        <button
          className={`demo-toggle ${isDemoMode ? 'active' : ''}`}
          onClick={toggleDemoMode}
          id="demo-toggle"
          title="Toggle Demo Mode (cached data)"
        >
          <Radio size={14} />
          Demo
          <span className={`toggle-switch ${isDemoMode ? 'active' : ''}`} />
        </button>
      </div>
    </header>
  );
}
