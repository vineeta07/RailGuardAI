import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoModeProvider } from './hooks/useDemoMode';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import RakeManagement from './pages/RakeManagement';
import TrackHealth from './pages/TrackHealth';
import RollingStock from './pages/RollingStock';
import ForwardVision from './pages/ForwardVision';
import Sustainability from './pages/Sustainability';
import './App.css';

export default function App() {
  return (
    <DemoModeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/rakes" element={<RakeManagement />} />
            <Route path="/track-health" element={<TrackHealth />} />
            <Route path="/rolling-stock" element={<RollingStock />} />
            <Route path="/forward-vision" element={<ForwardVision />} />
            <Route path="/sustainability" element={<Sustainability />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DemoModeProvider>
  );
}
