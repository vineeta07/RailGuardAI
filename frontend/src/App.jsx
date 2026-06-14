import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { DemoModeProvider } from './hooks/useDemoMode';
import Layout from './components/layout/Layout';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NetworkMap from './pages/NetworkMap';
import FleetTriage from './pages/FleetTriage';
import Reallocation from './pages/Reallocation';
import TrackHealth from './pages/TrackHealth';
import ForwardVision from './pages/ForwardVision';

import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DemoModeProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected — App Shell */}
              <Route path="/app" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="network-map" element={<NetworkMap />} />
                <Route path="fleet-triage" element={<FleetTriage />} />
                <Route path="reallocation" element={<Reallocation />} />
                <Route path="track-health" element={<TrackHealth />} />
                <Route path="forward-vision" element={<ForwardVision />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DemoModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
