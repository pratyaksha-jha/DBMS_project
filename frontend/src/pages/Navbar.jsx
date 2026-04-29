import { useNavigate } from "react-router-dom";
import { useState } from "react"; 
export default function Navbar() {
    const navigate = useNavigate();

    return (
        <>
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
        </>
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

  const S = {
    root: {
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      background: 'var(--bg)',
      fontFamily: 'inherit',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    },
    nav: {
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-strong)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      height: 70,
    },
    brandGroup: { display: 'flex', alignItems: 'center', gap: 13, flexShrink: 0 },
    brandEmblem: {
      width: 46, height: 46, borderRadius: 11,
      border: '1px solid var(--accent-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-soft)',
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
    }

  };