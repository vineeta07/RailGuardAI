import { Radio } from 'lucide-react';

export default function DemoModeBanner() {
  return (
    <div className="demo-banner" id="demo-mode-banner">
      <Radio size={16} />
      📡 Demo Mode — Showing cached data
    </div>
  );
}
