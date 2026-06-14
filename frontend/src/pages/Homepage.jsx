import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import {
  Map, Activity, Brain, Eye, Shield,
  ArrowRight, Sun, Moon, Leaf, Globe, FileText, Lock
} from 'lucide-react';

const features = [
  { icon: Map, color: 'var(--accent)', title: 'DIGITAL TWIN NETWORK', desc: 'Live geographic visualization of 20+ rakes across the Indian railway network with real-time health monitoring.' },
  { icon: Brain, color: '#a78bfa', title: 'AI REALLOCATION', desc: 'Hugging Face–powered decision engine that optimizes cargo-rake matching using multi-factor scoring.' },
  { icon: Activity, color: 'var(--success)', title: 'TRACK HEALTH', desc: 'ML-based predictive maintenance analyzing vibration, temperature, and sound to prevent derailments.' },
  { icon: Eye, color: 'var(--danger)', title: 'FORWARD VISION', desc: 'YOLOv11 object detection for real-time obstacle identification on railway tracks up to 700m ahead.' },
  { icon: Shield, color: 'var(--cyan)', title: 'FLEET TRIAGE', desc: 'Priority-sorted fleet monitoring with critical asset isolation and predictive failure alerting.' },
  { icon: Leaf, color: 'var(--success)', title: 'SUSTAINABILITY', desc: 'Track CO₂ savings, empty-km avoidance, and revenue optimization in real-time.' },
  { icon: Globe, color: 'var(--accent)', title: 'MULTILINGUAL', desc: 'Full multilingual interface localized for diverse railway operations and staff across regions.' },
  { icon: FileText, color: 'var(--neon)', title: 'AUTOMATED REPORTS', desc: 'Background Python daemon generating formatted DOCX and PPTX slide decks summarizing fleet status.' },
  { icon: Lock, color: 'var(--warning)', title: 'SECURE AUTH', desc: 'Encrypted JWT-based access control protecting critical command center infrastructure.' },
];

export default function Homepage() {
  const { theme, toggle } = useTheme();
  const { i18n } = useTranslation();
  const { scrollYProgress } = useScroll();
  
  // Scroll-driven motion for the right-side hero element
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 15]);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', fontFamily: "'Space Mono', monospace" }}>
      {/* Brutalist Top Bar */}
      <div className="brutal-topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', background: 'var(--bg-base)', 
        borderBottom: '2px solid var(--text-primary)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none', color: 'inherit' }}>
          <img src="/logo.png" alt="RailGuard Logo" style={{ height: 40, width: 40, objectFit: 'contain', zIndex: 10, marginRight: 8 }} />
          <div style={{ fontSize: '24px', fontWeight: 700, zIndex: 10, fontFamily: "'Playfair Display', serif", textTransform: 'uppercase', letterSpacing: '-1px' }}>
            Rail<span style={{ color: 'var(--accent)' }}>Guard</span>
          </div>
        </Link>
        <div className="brutal-topbar-controls" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="lang-select" style={{ display: 'flex', alignItems: 'center', gap: 8, border: '2px solid var(--text-primary)', padding: '4px 12px', background: 'var(--bg-surface)' }}>
            <Globe size={16} />
            <select 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}
            >
              <option value="en">ENG</option>
              <option value="hi">HIN</option>
              <option value="bn">BEN</option>
              <option value="ta">TAM</option>
            </select>
          </div>
          <button onClick={toggle} title="Toggle theme" style={{ border: '2px solid var(--text-primary)', padding: '8px', background: 'var(--bg-surface)', color: 'var(--text-primary)', display: 'flex' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" style={{ border: '2px solid var(--text-primary)', padding: '8px 16px', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontWeight: 700, textTransform: 'uppercase', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>

      {/* Split-Screen Hero */}
      <section className="brutal-hero-section" style={{ display: 'flex', minHeight: '100vh', paddingTop: '75px', borderBottom: '2px solid var(--text-primary)' }}>
        {/* Left Side: Raw Typography */}
        <div className="brutal-hero-left" style={{ flex: 1, padding: '8% 5% 15% 5%', borderRight: '2px solid var(--text-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.h1 
            className="brutal-hero-h1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
              lineHeight: '0.9', 
              fontWeight: 900, 
              textTransform: 'uppercase',
              margin: '0 0 40px 0',
              letterSpacing: '-2px',
              color: 'var(--text-primary)'
            }}
          >
            Railway Operations, 
            Awakened.<br/>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: '18px', maxWidth: '600px', lineHeight: '1.6', marginBottom: '48px', color: 'var(--text-secondary)' }}
          >
            Orchestrating the future of the supply chain. RailGuard is a unified intelligence layer that turns live track data and forward vision safety feeds into instant, revenue driving decisions.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/signup" className="brutal-hero-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, border: '2px solid var(--text-primary)', padding: '16px 32px', background: 'var(--text-primary)', color: 'var(--bg-base)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', textDecoration: 'none', boxShadow: '8px 8px 0 var(--accent)' }}>
              Launch Dashboard <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Scroll-Driven Asymmetric Visual */}
        <div className="brutal-hero-right" style={{ flex: 1, background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* A brutalist structural element that responds to scroll */}
          <motion.div 
            style={{ 
              width: '75%', 
              background: 'var(--accent)', 
              border: '4px solid var(--text-primary)', 
              boxShadow: '16px 16px 0 var(--text-primary)',
              y: yPos,
              rotate: rotate,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--bg-base)', borderBottom: '2px solid var(--bg-base)', paddingBottom: '8px', marginBottom: '8px' }}>
              SYSTEM ARCHITECTURE_
            </div>
            {[
              "Track Sensors",
              "+ Rolling Stock Sensors",
              "+ Forward Vision Cameras",
              "+ GPS Tracking",
              "          ↓",
              "   Data Collection Layer",
              "          ↓",
              "        Backend",
              "          ↓",
              "      AI Models",
              "          ↓",
              "   Decision Engine",
              "          ↓",
              "Dashboard & Visualization",
              "          ↓",
              " Alerts & Recommendations"
            ].map((step, idx) => (
              <div key={idx} style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 800, color: 'var(--bg-base)', whiteSpace: 'pre' }}>
                {step}
              </div>
            ))}
          </motion.div>
          {/* Decorative grid lines */}
          <div style={{ position: 'absolute', top: '20%', left: 0, width: '100%', height: '2px', background: 'var(--text-primary)', opacity: 0.2 }} />
          <div style={{ position: 'absolute', top: '80%', left: 0, width: '100%', height: '2px', background: 'var(--text-primary)', opacity: 0.2 }} />
          <div style={{ position: 'absolute', top: 0, left: '20%', width: '2px', height: '100%', background: 'var(--text-primary)', opacity: 0.2 }} />
        </div>
      </section>

      {/* Brutalist Stats Strip */}
      <section className="brutal-stats" style={{ display: 'flex', borderBottom: '2px solid var(--text-primary)', background: 'var(--accent)' }}>
        {[
          { v: '₹1.24Cr', l: 'REVENUE SAVED' },
          { v: '8,520', l: 'EMPTY KM' },
          { v: '48.7T', l: 'CO2 REDUCED' },
          { v: '142', l: 'AI DECISIONS' }
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '32px 24px', borderRight: i !== 3 ? '2px solid var(--text-primary)' : 'none', textAlign: 'center', color: 'var(--bg-base)' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', fontWeight: 900, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '8px' }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* Raw Asymmetric Grid Features */}
      <section style={{ padding: '80px 5%', background: 'var(--bg-base)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, textTransform: 'uppercase', borderBottom: '4px solid var(--text-primary)', paddingBottom: '24px', marginBottom: '64px' }}>
          SYSTEM CAPABILITIES.
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ 
                  border: '2px solid var(--text-primary)', 
                  background: 'var(--bg-surface)', 
                  padding: '32px',
                  boxShadow: `8px 8px 0 ${f.color}`
                }}
              >
                <div style={{ borderBottom: '2px solid var(--text-primary)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{f.title}</h3>
                  <Icon size={28} color={f.color} />
                </div>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Brutalist Footer */}
      <footer className="brutal-footer" style={{ borderTop: '4px solid var(--text-primary)', padding: '40px 5%', background: 'var(--text-primary)', color: 'var(--bg-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 900 }}>RAILGUARD AI</div>
        <div style={{ fontSize: '12px', fontWeight: 700 }}>© 2026 // END OF TRANSMISSION</div>
      </footer>
    </div>
  );
}
