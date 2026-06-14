import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import {
  Train, Map, Activity, Brain, Eye, Shield,
  ArrowRight, Sun, Moon, Zap, BarChart3, Leaf, Globe
} from 'lucide-react';

const features = [
  { icon: Map, color: 'var(--accent)', bg: 'var(--accent-dim)', title: 'Digital Twin Network', desc: 'Live geographic visualization of 20+ rakes across the Indian railway network with real-time health monitoring.' },
  { icon: Brain, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', title: 'AI Reallocation Engine', desc: 'Hugging Face–powered decision engine that optimizes cargo-rake matching using multi-factor scoring.' },
  { icon: Activity, color: 'var(--success)', bg: 'var(--success-dim)', title: 'Track Health Monitor', desc: 'ML-based predictive maintenance analyzing vibration, temperature, and sound to prevent derailments.' },
  { icon: Eye, color: 'var(--danger)', bg: 'var(--danger-dim)', title: 'Forward Vision Safety', desc: 'YOLOv11 object detection for real-time obstacle identification on railway tracks up to 700m ahead.' },
  { icon: Shield, color: 'var(--cyan)', bg: 'var(--cyan-dim)', title: 'Fleet Triage System', desc: 'Priority-sorted fleet monitoring with critical asset isolation and predictive failure alerting.' },
  { icon: Leaf, color: 'var(--success)', bg: 'var(--success-dim)', title: 'Sustainability Impact', desc: 'Track CO₂ savings, empty-km avoidance, and revenue optimization in real-time.' },
  { icon: Eye, color: 'var(--accent)', bg: 'var(--accent-dim)', title: 'Multilingual Support', desc: 'Full multilingual interface localized for diverse railway operations and staff across regions.' },
];

const stats = [
  { value: '₹1.24Cr', label: 'Revenue Saved' },
  { value: '8,520', label: 'Empty KM Avoided' },
  { value: '48.7T', label: 'CO₂ Reduced' },
  { value: '142', label: 'AI Decisions' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function Homepage() {
  const { theme, toggle } = useTheme();
  const { i18n } = useTranslation();

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 32px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-logo"><Train size={16} /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Rail<span style={{ color: 'var(--accent)' }}>Guard</span> AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', marginRight: 8 }}>
            <Globe size={14} style={{ color: 'var(--text-muted)' }}/>
            <select 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            >
              <option value="en">Eng</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
          <button className="theme-toggle" onClick={toggle} title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="landing-hero">

        <motion.h1 className="landing-h1" {...fadeUp(0.1)}>
          Intelligent Railway <span>Command Center</span>
        </motion.h1>

        <motion.p className="landing-p" {...fadeUp(0.2)}>
          RailGuard AI combines digital twin technology, predictive ML models, and real-time computer vision 
          to optimize freight operations. We utilize state-of-the-art Hugging Face models for dynamic reallocation, 
          YOLOv11 for millimeter-accurate forward vision obstacle detection, and custom ensemble learning for track 
          health prognostics. Our neural networks continuously process live telemetry to prevent failures and save 
          millions in operational costs.
        </motion.p>

        <motion.div className="landing-btns" {...fadeUp(0.3)}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
            Launch Dashboard <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '12px 28px', fontSize: 14 }}>
            Sign In
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div className="landing-stats" {...fadeUp(0.45)}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="landing-stat-num">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '40px 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2
          style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}
          {...fadeUp(0)}
        >
          Four AI Modules, <span style={{ color: 'var(--accent)' }}>One Platform</span>
        </motion.h2>
        <motion.p
          style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 15, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}
          {...fadeUp(0.05)}
        >
          Each module is independently trained and deployed, unified through a single command center interface.
        </motion.p>

        <div className="landing-features">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="landing-feat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              >
                <div className="landing-feat-icon" style={{ background: f.bg, color: f.color }}>
                  <Icon size={20} />
                </div>
                <div className="landing-feat-title">{f.title}</div>
                <div className="landing-feat-desc">{f.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Architecture */}
      <section style={{ padding: '48px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }} {...fadeUp()}>
            Tech Stack
          </motion.h2>
          <motion.div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 20 }}
            {...fadeUp(0.1)}
          >
            {['React 19', 'Vite', 'FastAPI', 'Leaflet.js', 'Recharts', 'Framer Motion', 'YOLOv11', 'Scikit-learn', 'Hugging Face', 'Capacitor'].map(t => (
              <span key={t} style={{
                padding: '6px 16px', borderRadius: 99, border: '1px solid var(--border)',
                fontSize: 12, fontWeight: 500, background: 'var(--bg-card)', color: 'var(--text-secondary)'
              }}>
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', textAlign: 'center' }}>
        <motion.h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }} {...fadeUp()}>
          Ready to Transform Railway Operations?
        </motion.h2>
        <motion.p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }} {...fadeUp(0.05)}>
          Deploy the future of intelligent freight management.
        </motion.p>
        <motion.div {...fadeUp(0.1)}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 15 }}>
            Get Started <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <div className="landing-footer">
        © 2026 RailGuard AI — Built with ❤️ by Team
      </div>
    </div>
  );
}
