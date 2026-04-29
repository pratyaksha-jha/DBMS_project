import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IndiaMap from '../components/IndiaMap';

/* hero image */
import heroImage from '../assets/logo_image2.jpg';

/* ─── Domain data with inline SVG icons ─── */
const domains = [
  {
    name: 'Overall',
    description: 'All institutions ranked across every discipline',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 44, height: 44 }}>
        <circle cx="24" cy="24" r="19" />
        <ellipse cx="24" cy="24" rx="10" ry="19" />
        <line x1="5" y1="24" x2="43" y2="24" />
        <path d="M8 14 Q24 18 40 14" />
        <path d="M8 34 Q24 30 40 34" />
      </svg>
    ),
    accent: '#3b82f6',
  },
  {
    name: 'Engineering',
    description: 'Top technical & engineering colleges in India',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 44, height: 44 }}>
        <rect x="6" y="6" width="36" height="36" rx="4" />
        <rect x="14" y="14" width="8" height="8" rx="1" />
        <rect x="26" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="26" width="8" height="8" rx="1" />
        <rect x="26" y="26" width="8" height="8" rx="1" />
        <line x1="22" y1="18" x2="26" y2="18" />
        <line x1="22" y1="30" x2="26" y2="30" />
        <line x1="18" y1="22" x2="18" y2="26" />
        <line x1="30" y1="22" x2="30" y2="26" />
        <line x1="14" y1="6" x2="14" y2="3" /><line x1="22" y1="6" x2="22" y2="3" />
        <line x1="30" y1="6" x2="30" y2="3" />
        <line x1="14" y1="42" x2="14" y2="45" /><line x1="22" y1="42" x2="22" y2="45" />
        <line x1="30" y1="42" x2="30" y2="45" />
      </svg>
    ),
    accent: '#f97316',
  },
  {
    name: 'Research',
    description: 'Institutions leading innovation & discovery',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 44, height: 44 }}>
        <path d="M18 6 L18 22 L8 38 Q6 42 10 42 L38 42 Q42 42 40 38 L30 22 L30 6 Z" />
        <line x1="15" y1="6" x2="33" y2="6" />
        <path d="M12 34 Q16 30 24 32 Q32 34 36 30 L40 38 Q42 42 38 42 L10 42 Q6 42 8 38 Z" fill="currentColor" opacity="0.15" stroke="none" />
        <path d="M12 34 Q16 30 24 32 Q32 34 36 30" />
        <circle cx="20" cy="36" r="1.2" fill="currentColor" />
        <circle cx="28" cy="33" r="1" fill="currentColor" />
      </svg>
    ),
    accent: '#10b981',
  },
  {
    name: 'Management',
    description: 'Premier business & management institutions',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 44, height: 44 }}>
        <path d="M10 16 L24 8 L38 16 L38 34 L10 34 Z" />
        <rect x="14" y="20" width="20" height="10" rx="2" />
        <line x1="24" y1="8" x2="24" y2="4" />
        <circle cx="24" cy="3" r="1.5" fill="currentColor" />
        <line x1="16" y1="34" x2="12" y2="44" />
        <line x1="32" y1="34" x2="36" y2="44" />
        <line x1="10" y1="44" x2="38" y2="44" />
        <line x1="18" y1="23" x2="30" y2="23" />
        <line x1="18" y1="26" x2="26" y2="26" />
      </svg>
    ),
    accent: '#8b5cf6',
  },
];

const stats = [
  { value: '6,000+', label: 'Institutions Ranked' },
  { value: '13', label: 'Ranking Categories' },
  { value: '2015', label: 'Established' },
  { value: '36', label: 'States & UTs Covered' },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={S.root}>

      {/* ── Navbar ── */}
      <nav style={S.nav}>
        <div style={S.brandGroup}>
          <div style={S.brandEmblem}>
            <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
              <circle cx="16" cy="16" r="13" stroke="#f5a623" strokeWidth="2" />
              <line x1="16" y1="4" x2="16" y2="28" stroke="#f5a623" strokeWidth="1.5" />
              <line x1="4" y1="16" x2="28" y2="16" stroke="#f5a623" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="4" fill="#f5a623" />
            </svg>
          </div>
          <div>
            <span style={S.brandName}>NIRF</span>
            <span style={S.brandSub}>India Rankings</span>
          </div>
        </div>

        <div style={S.navLinks}>
          <NavBtn label="Home" onClick={() => navigate('/')} />
          <NavBtn label="About Us" onClick={() => navigate('/about')} />
          <NavBtn label="Institute analysis" onClick={() => navigate('/institute_analysis')} />
          <NavBtn label="Overall analysis" onClick={() => navigate('/overall_analysis')} />
          <NavBtn label="IITG" onClick={() => navigate('/iitg')} />
        </div>
      </nav>

      {/* ── Hero with local campus photo ── */}
      <div style={S.hero}>
        <div style={{ ...S.heroBg, backgroundImage: `url(${heroImage})` }} />
        <div style={S.heroOverlay} />

        <div style={S.heroContent}>
          <p style={S.heroEyebrow}>National Institutional Ranking Framework</p>
          <h1 style={S.heroTitle}>Rankings Overview</h1>
          <p style={S.heroSub}>
            Explore performance metrics, state-wise distributions, and category leaders
            across India's higher education landscape.
          </p>
        </div>
      </div>

      {/* ── Stat bar ── */}
      <div style={S.statBar}>
        {stats.map((s, i) => (
          <div key={i} style={{
            ...S.statItem,
            borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <span style={S.statVal}>{s.value}</span>
            <span style={S.statLbl}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <main style={S.main}>

        {/* Domain Cards */}
        <section>
          <div style={S.secHeader}>
            <span style={S.secTag}>EXPLORE BY CATEGORY</span>
            <h2 style={S.secTitle}>Ranking Domains</h2>
          </div>
          <div style={S.cardGrid}>
            {domains.map((d, i) => (
              <DomainCard key={i} domain={d} delay={i * 80} visible={visible} navigate={navigate} />
            ))}
          </div>
        </section>

        {/* Map */}
        <section>
          <div style={S.secHeader}>
            <span style={S.secTag}>GEOGRAPHIC DISTRIBUTION</span>
            <h2 style={S.secTitle}>Institution Map</h2>
          </div>
          <div style={S.mapCard}>
            <IndiaMap />
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        © 2026 National Institutional Ranking Framework · Ministry of Education, Govt. of India
      </footer>
    </div>
  );
}

/* ── Nav button ── */
function NavBtn({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      style={{ ...S.navBtn, color: hov ? '#f5a623' : 'rgba(255,255,255,0.85)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {label}
    </button>
  );
}

/* ── Domain card ── */
function DomainCard({ domain, delay, visible, navigate }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      // Routes to overall_analysis and passes the chosen category inside the route state
      onClick={() => navigate('/overall_analysis', { state: { selectedCategory: domain.name } })}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...S.card,
        opacity: visible ? 1 : 0,
        transform: visible ? (hov ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(22px)',
        transitionDelay: `${delay}ms`,
        background: hov ? 'linear-gradient(145deg, #0c1e3e 0%, #0f2a52 100%)' : '#ffffff',
        boxShadow: hov
          ? `0 22px 50px rgba(15,31,61,0.20), 0 0 0 1px ${domain.accent}44`
          : '0 2px 18px rgba(15,31,61,0.07)',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: domain.accent, borderRadius: '16px 16px 0 0',
        opacity: hov ? 1 : 0.35, transition: 'opacity 0.25s',
      }} />

      <div style={{ color: hov ? domain.accent : '#0f1f3d', transition: 'color 0.22s', marginBottom: 6, marginTop: 6 }}>
        {domain.icon}
      </div>

      <h3 style={{ ...S.cardTitle, color: hov ? '#ffffff' : '#0f1f3d' }}>
        {domain.name}
      </h3>
      <p style={{ ...S.cardDesc, color: hov ? 'rgba(255,255,255,0.6)' : '#6b7280' }}>
        {domain.description}
      </p>

      <div style={{ color: hov ? domain.accent : '#0f1f3d', transition: 'color 0.22s', marginTop: 8, alignSelf: 'flex-start' }}>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
          <path d="M4 10h12M10 4l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════ */
const S = {
  root: {
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    background: '#f4f6f9',
    fontFamily: 'inherit',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  nav: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#0c1e3e',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(245,166,35,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    height: 70,
  },
  brandGroup: { display: 'flex', alignItems: 'center', gap: 13, flexShrink: 0 },
  brandEmblem: {
    width: 46, height: 46, borderRadius: 11,
    border: '1px solid rgba(245,166,35,0.32)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(245,166,35,0.07)',
  },
  brandName: {
    display: 'block', fontSize: 25, fontWeight: 700, color: '#fff',
    letterSpacing: '0.06em', lineHeight: 1.1, fontFamily: 'inherit',
  },
  brandSub: {
    display: 'block', fontSize: 11.5, color: '#f5a623',
    letterSpacing: '0.16em', textTransform: 'uppercase', lineHeight: 1.4, fontWeight: 600,
  },
  navLinks: {
    display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', flexShrink: 0,
    justifyContent: 'flex-end', maxWidth: 'min(100%, 720px)',
  },
  navBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13.5, fontWeight: 500, letterSpacing: '0.01em',
    padding: '7px 16px', borderRadius: 6,
    transition: 'color 0.18s, background 0.18s', fontFamily: 'inherit',
  },
  hero: {
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 340,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
    backgroundRepeat: 'no-repeat',
    transform: 'scale(1.03)',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(105deg, rgba(10,22,50,0.93) 0%, rgba(15,32,70,0.88) 55%, rgba(18,40,80,0.80) 100%)',
  },
  heroContent: {
    position: 'relative', zIndex: 1,
    textAlign: 'center', padding: '64px 40px 60px',
    width: '100%', boxSizing: 'border-box',
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: 600, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#f5a623', margin: '0 0 14px',
  },
  heroTitle: {
    fontSize: 50, fontWeight: 700, color: '#fff',
    margin: '0 0 18px', fontFamily: 'inherit',
    letterSpacing: '-0.01em', lineHeight: 1.1,
  },
  heroSub: {
    fontSize: 15.5, color: 'rgba(255,255,255,0.65)',
    maxWidth: 560, lineHeight: 1.7, margin: '0 auto',
  },
  statBar: {
    width: '100%', boxSizing: 'border-box',
    background: '#0f1f3d',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', justifyContent: 'space-evenly',
  },
  statItem: {
    padding: '20px 0', flex: 1,
    textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4,
  },
  statVal: {
    fontSize: 24, fontWeight: 700, color: '#f5a623',
    fontFamily: 'inherit', letterSpacing: '-0.02em',
  },
  statLbl: {
    fontSize: 10, color: 'rgba(255,255,255,0.42)',
    letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500,
  },
  main: {
    width: '100%', boxSizing: 'border-box',
    padding: '52px 40px 44px',
    display: 'flex', flexDirection: 'column', gap: 52,
  },
  secHeader: { marginBottom: 26 },
  secTag: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#f5a623', display: 'block', marginBottom: 7,
  },
  secTitle: {
    fontSize: 28, fontWeight: 700, color: '#0f1f3d', margin: 0,
    fontFamily: 'inherit', letterSpacing: '-0.01em',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 20,
    width: '100%',
  },
  card: {
    borderRadius: 16, padding: '28px 24px 24px',
    cursor: 'pointer', position: 'relative', overflow: 'hidden',
    transition: 'all 0.28s cubic-bezier(0.34,1.2,0.64,1)',
    border: '1px solid rgba(15,31,61,0.08)',
    display: 'flex', flexDirection: 'column', gap: 8,
    boxSizing: 'border-box',
  },
  cardTitle: {
    fontSize: 18, fontWeight: 700, margin: 0,
    transition: 'color 0.22s', fontFamily: 'inherit',
  },
  cardDesc: {
    fontSize: 13, margin: 0, lineHeight: 1.6,
    transition: 'color 0.22s', flex: 1,
  },
  mapCard: {
    background: '#fff', borderRadius: 20, padding: '32px',
    boxShadow: '0 2px 20px rgba(15,31,61,0.07)',
    border: '1px solid rgba(15,31,61,0.06)',
    width: '100%', boxSizing: 'border-box',
  },
  footer: {
    width: '100%', boxSizing: 'border-box',
    textAlign: 'center', padding: '22px 40px',
    fontSize: 12, color: '#9ca3af', letterSpacing: '0.02em',
    borderTop: '1px solid #e5e7eb', background: '#f4f6f9',
  },
};