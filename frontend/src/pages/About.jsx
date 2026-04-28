import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import saharshiniPhoto from './saharshini.jpg';
import pratyakshaPhoto from './pratyaksha.jpg';
import somitaPhoto     from './somita.jpg';
import sharanyaPhoto   from './sharanya.jpg';
import yasaswiPhoto    from './yasaswi.jpg';


const TEAM = [
  { name: 'Nayakwadi Saharshini', roll: '240150021', initials: 'NS', photo: saharshiniPhoto },
  { name: 'Pratyaksha Jha',       roll: '240150025', initials: 'PJ', photo: pratyakshaPhoto },
  { name: 'Somita Agarwal',       roll: '240150036', initials: 'SA', photo: somitaPhoto     },
  { name: 'Sunkari Sharanya',     roll: '240150036', initials: 'SS', photo: sharanyaPhoto   },
  { name: 'Yendluri Yasaswi',     roll: '240150040', initials: 'YY', photo: yasaswiPhoto    },
];

const PORTAL_STATS = [
  { value: '5',   label: 'Years of Data' },
  { value: '4',   label: 'Ranking Domains' },
  { value: '355', label: 'Institutions' },
  { value: '36',  label: 'States & UTs' },
];

const ACCENTS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#f5a623'];

export default function About() {
  const navigate = useNavigate();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={S.root}>

      <nav style={S.nav}>
        <div style={S.brandGroup}>
          <div style={S.brandEmblem}>
            <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
              <circle cx="16" cy="16" r="13" stroke="#f5a623" strokeWidth="2" />
              <line x1="16" y1="4"  x2="16" y2="28" stroke="#f5a623" strokeWidth="1.5" />
              <line x1="4"  y1="16" x2="28" y2="16" stroke="#f5a623" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="4" fill="#f5a623" />
            </svg>
          </div>
          <div>
            <span style={S.brandName}>NIRF</span>
            <span style={S.brandSub}>India Rankings</span>
          </div>
        </div>

        <div style={S.navLinks}>
          <NavBtn label="Home"               onClick={() => navigate('/')} />
          <NavBtn label="About Us"           onClick={() => navigate('/about')} active />
          <NavBtn label="Institute analysis" onClick={() => navigate('/institute_analysis')} />
          <NavBtn label="Overall analysis"   onClick={() => navigate('/overall_analysis')} />
          <NavBtn label="IITG"               onClick={() => navigate('/iitg')} />
        </div>
      </nav>

      <div style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          <p style={S.heroEyebrow}>DBMS Course Project · Mehta Family School of Data Science &amp; Artificial Intelligence</p>
          <h1 style={S.heroTitle}>About the Portal</h1>
          <p style={S.heroSub}>
            A full-stack analytics platform built to explore, visualise, and
            compare five years of NIRF ranking data across India's higher
            education landscape, designed and developed by students of
            IIT Guwahati.
          </p>
        </div>
      </div>

      <div style={S.statBar}>
        {PORTAL_STATS.map((s, i) => (
          <div key={i} style={{
            ...S.statItem,
            borderRight: i < PORTAL_STATS.length - 1
              ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <span style={S.statVal}>{s.value}</span>
            <span style={S.statLbl}>{s.label}</span>
          </div>
        ))}
      </div>

      <main style={S.main}>

        <section>
          <div style={S.secHeader}>
            <span style={S.secTag}>WHAT WE BUILT</span>
            <h2 style={S.secTitle}>NIRF Insights Portal</h2>
          </div>

          <div style={S.projectGrid}>

            <div style={S.projectCard}>
              <div style={S.featureIconWrap('#3b82f6')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: 26, height: 26 }}>
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v4c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 9v4c0 1.66 4.03 3 9 3s9-1.34 9-3V9" />
                  <path d="M3 13v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4" />
                </svg>
              </div>
              <h3 style={S.featureTitle}>Structured Database</h3>
              <p style={S.featureDesc}>
                Scraped and normalised NIRF data (2021–2025) into a clean
                SQLite schema with three core tables — <em>institutes</em>,&nbsp;
                <em>rankings</em>, and <em>parameters</em> — plus dedicated
                tables for budget and placement data.
              </p>
            </div>

            <div style={S.projectCard}>
              <div style={S.featureIconWrap('#f97316')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: 26, height: 26 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <h3 style={S.featureTitle}>Interactive India Map</h3>
              <p style={S.featureDesc}>
                Geographic visualisation of ranked institutions overlaid on
                an SVG/TopoJSON map of India, powered by geo-coordinates
                fetched from OpenStreetMap for every institute.
              </p>
            </div>

            <div style={S.projectCard}>
              <div style={S.featureIconWrap('#10b981')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: 26, height: 26 }}>
                  <rect x="3"  y="12" width="4" height="9" rx="1" />
                  <rect x="10" y="7"  width="4" height="14" rx="1" />
                  <rect x="17" y="3"  width="4" height="18" rx="1" />
                </svg>
              </div>
              <h3 style={S.featureTitle}>Institute Analytics</h3>
              <p style={S.featureDesc}>
                Drill down into any institute across four domains — Overall,
                Engineering, Management, Research — with rank-trend lines,
                NIRF parameter breakdowns, expenditure pie charts, and
                placement statistics.
              </p>
            </div>

            <div style={S.projectCard}>
              <div style={S.featureIconWrap('#8b5cf6')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" style={{ width: 26, height: 26 }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 style={S.featureTitle}>IITG Spotlight</h3>
              <p style={S.featureDesc}>
                A dedicated deep-dive section for IIT Guwahati, tracking its
                NIRF trajectory across domains, comparing parameter scores
                against peer institutions, and showcasing various trends like budget, maintenance, research
                and others over five years.
              </p>
            </div>

          </div>
        </section>

        <section>
          <div style={S.secHeader}>
            <h2 style={S.secTitle}>Course Instructor</h2>
          </div>

          <div style={S.profCard}>
            <div style={S.profStrip} />

            <div style={S.profInner}>
              <div style={S.profAvatarWrap}>
                <img
                  src="https://debanga.github.io/images/debanga-554x576.jpg"
                  alt="Dr. Debanga Raj Neog"
                  style={S.profAvatar}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>

              <div style={S.profInfo}>
                <h3 style={S.profName}>Dr. Debanga Raj Neog</h3>
                <p style={S.profRole}>Assistant Professor</p>

                <a
                  href="https://www.iitg.ac.in/dsai/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.profDeptLink}
                  onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3b82f6'}
                >
                  Mehta Family School of Data Science &amp; Artificial Intelligence
                </a>

                <a
                  href="https://www.iitg.ac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.profInstLink}
                  onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  Indian Institute of Technology Guwahati
                </a>

                <div style={S.profTagRow}>
                  <Tag label="Computer Vision"  color="#3b82f6" />
                  <Tag label="Deep Learning"    color="#10b981" />
                  <Tag label="Ph.D. UBC Canada" color="#f5a623" />
                </div>

                <p style={S.profBio}>
                  Dr. Neog holds a Ph.D. in Computer Science from the University
                  of British Columbia, Vancouver, and a B.Tech in Electronics
                  &amp; Communication Engineering from IIT Guwahati. With over
                  14 years of experience across academia and industry, including
                  co-founding a computational imaging startup, his research spans
                  computer vision, deep learning, and biomedical image analysis.
                  He is a recipient of the Young Scientist Award by the Assam
                  Science Technology and Environment Council (2023) and the Young
                  Faculty Excellence in Teaching Award, IIT Guwahati (2025).
                </p>

                <a
                  href="https://debanga.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.profLink}
                  onMouseEnter={e => e.currentTarget.style.background = '#d4881a'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f5a623'}
                >
                  View Profile →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div style={S.secHeader}>
            <h2 style={S.secTitle}>Our Team</h2>
          </div>

          <div style={S.teamGrid}>
            {TEAM.map((member, i) => (
              <MemberCard
                key={i}
                member={member}
                accent={ACCENTS[i]}
                delay={i * 70}
                visible={visible}
              />
            ))}
          </div>
        </section>

        <section>
          <div style={S.secHeader}>
            <h2 style={S.secTitle}>Technology Stack</h2>
          </div>
          <div style={S.techGrid}>
            {[
              { label: 'BeautifulSoup',     cat: 'Scraping',  color: '#f97316' },
              { label: 'SQLite',            cat: 'Database',  color: '#3b82f6' },
              { label: 'FastAPI',           cat: 'Backend',   color: '#10b981' },
              { label: 'React + Vite',      cat: 'Frontend',  color: '#8b5cf6' },
              { label: 'Recharts',          cat: 'Charts',    color: '#f5a623' },
              { label: 'react-simple-maps', cat: 'Maps',      color: '#ec4899' },
              { label: 'OpenStreetMap',     cat: 'Geocoding', color: '#06b6d4' },
              { label: 'Python',            cat: 'Language',  color: '#eab308' },
            ].map((t, i) => (
              <div key={i} style={S.techPill}>
                <span style={{ ...S.techDot, background: t.color }} />
                <div>
                  <span style={S.techName}>{t.label}</span>
                  <span style={S.techCat}>{t.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer style={S.footer}>
        © 2026 NIRF Insights Portal · B.Tech DS&amp;AI, IIT Guwahati ·
        Mehta Family School of Data Science &amp; Artificial Intelligence
      </footer>
    </div>
  );
}


function MemberCard({ member, accent, delay, visible }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...S.memberCard,
        opacity:         visible ? 1 : 0,
        transform:       visible
          ? (hov ? 'translateY(-6px)' : 'translateY(0)')
          : 'translateY(22px)',
        transitionDelay: `${delay}ms`,
        boxShadow: hov
          ? `0 22px 50px rgba(15,31,61,0.16), 0 0 0 1px ${accent}44`
          : '0 2px 18px rgba(15,31,61,0.07)',
      }}
    >
      <div style={{ ...S.memberStrip, background: accent, opacity: hov ? 1 : 0.35 }} />

      <div
        style={{
          ...S.avatarCircle,
          borderColor: accent,
          background: member.photo ? 'transparent' : `${accent}18`,
        }}
      >
        {member.photo ? (
          <img src={member.photo} alt={member.name} style={S.avatarImg} />
        ) : (
          <span style={{ ...S.avatarInitials, color: accent }}>
            {member.initials}
          </span>
        )}
      </div>

      <h3 style={S.memberName}>{member.name}</h3>
      <p style={S.memberRoll}>{member.roll}</p>

      <div style={{ ...S.degreeBadge, borderColor: `${accent}55`, color: accent }}>
        B.Tech · DS&amp;AI · IIT Guwahati
      </div>
    </div>
  );
}

function NavBtn({ label, onClick, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        ...S.navBtn,
        color:      (hov || active) ? '#f5a623' : 'rgba(255,255,255,0.85)',
        fontWeight: active ? 600 : 500,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </button>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
      padding: '3px 10px', borderRadius: 20,
      border: `1px solid ${color}55`,
      color, background: `${color}12`,
    }}>
      {label}
    </span>
  );
}

const S = {
  root: {
    minHeight: '100vh', width: '100%', maxWidth: '100%',
    overflowX: 'hidden', background: '#f4f6f9',
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    margin: 0, padding: 0, boxSizing: 'border-box',
  },

  nav: {
    width: '100%', boxSizing: 'border-box',
    background: '#0c1e3e', position: 'sticky', top: 0, zIndex: 100,
    borderBottom: '1px solid rgba(245,166,35,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', height: 70,
  },
  brandGroup:  { display: 'flex', alignItems: 'center', gap: 13, flexShrink: 0 },
  brandEmblem: {
    width: 46, height: 46, borderRadius: 11,
    border: '1px solid rgba(245,166,35,0.32)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(245,166,35,0.07)',
  },
  brandName: {
    display: 'block', fontSize: 25, fontWeight: 700, color: '#fff',
    letterSpacing: '0.06em', lineHeight: 1.1, fontFamily: "'Georgia',serif",
  },
  brandSub: {
    display: 'block', fontSize: 11.5, color: '#f5a623',
    letterSpacing: '0.16em', textTransform: 'uppercase', lineHeight: 1.4, fontWeight: 600,
  },
  navLinks: {
    display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
    flexShrink: 0, justifyContent: 'flex-end', maxWidth: 'min(100%,720px)',
  },
  navBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13.5, letterSpacing: '0.01em', padding: '7px 16px',
    borderRadius: 6, transition: 'color 0.18s', fontFamily: 'inherit',
  },

  hero: {
    width: '100%', boxSizing: 'border-box', position: 'relative',
    overflow: 'hidden', minHeight: 320,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, #0a1632 0%, #0f2a52 60%, #0c1e3e 100%)',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(245,166,35,0.07) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 50%)
    `,
  },
  heroContent: {
    position: 'relative', zIndex: 1,
    textAlign: 'center', padding: '64px 40px 60px',
    width: '100%', boxSizing: 'border-box',
  },
  heroEyebrow: {
    fontSize: 12, fontWeight: 600, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#f5a623', margin: '0 0 14px',
  },
  heroTitle: {
    fontSize: 50, fontWeight: 700, color: '#fff',
    margin: '0 0 18px', fontFamily: "'Georgia','Times New Roman',serif",
    letterSpacing: '-0.01em', lineHeight: 1.1,
  },
  heroSub: {
    fontSize: 15.5, color: 'rgba(255,255,255,0.65)',
    maxWidth: 600, lineHeight: 1.75, margin: '0 auto',
  },

  statBar: {
    width: '100%', boxSizing: 'border-box', background: '#0f1f3d',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', justifyContent: 'space-evenly',
  },
  statItem: {
    padding: '20px 0', flex: 1, textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  statVal: {
    fontSize: 24, fontWeight: 700, color: '#f5a623',
    fontFamily: "'Georgia',serif", letterSpacing: '-0.02em',
  },
  statLbl: {
    fontSize: 10, color: 'rgba(255,255,255,0.42)',
    letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500,
  },

  main: {
    width: '100%', boxSizing: 'border-box',
    padding: '52px 40px 44px',
    display: 'flex', flexDirection: 'column', gap: 56,
  },
  secHeader:  { marginBottom: 28 },
  secTag: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#f5a623', display: 'block', marginBottom: 7,
  },
  secTitle: {
    fontSize: 28, fontWeight: 700, color: '#0f1f3d', margin: '0 0 8px',
    fontFamily: "'Georgia',serif", letterSpacing: '-0.01em',
  },

  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  },
  projectCard: {
    background: '#fff', borderRadius: 16, padding: '28px 24px',
    border: '1px solid rgba(15,31,61,0.08)',
    boxShadow: '0 2px 18px rgba(15,31,61,0.06)',
    display: 'flex', flexDirection: 'column',
  },
  featureIconWrap: (color) => ({
    width: 52, height: 52, borderRadius: 14, marginBottom: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `${color}14`, color, border: `1px solid ${color}28`,
  }),
  featureTitle: {
    fontSize: 15.5, fontWeight: 700, color: '#0f1f3d',
    margin: '0 0 10px', letterSpacing: '-0.01em',
  },
  featureDesc: {
    fontSize: 13.5, color: '#4b5563', lineHeight: 1.7, margin: 0,
  },

  profCard: {
    background: '#fff', borderRadius: 20, overflow: 'hidden',
    border: '1px solid rgba(15,31,61,0.08)',
    boxShadow: '0 4px 32px rgba(15,31,61,0.08)',
    position: 'relative',
  },
  profStrip: {
    height: 5,
    background: 'linear-gradient(90deg, #f5a623 0%, #f97316 50%, #3b82f6 100%)',
  },
  profInner: {
    display: 'flex', gap: 36, padding: '36px 40px',
    alignItems: 'flex-start', flexWrap: 'wrap',
  },
  profAvatarWrap: {
    width: 140, height: 140, borderRadius: 16, overflow: 'hidden',
    border: '3px solid rgba(245,166,35,0.3)', flexShrink: 0,
    background: '#f3f4f6',
  },
  profAvatar:   { width: '100%', height: '100%', objectFit: 'cover' },
  profInfo:     { flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 },
  profName: {
    fontSize: 22, fontWeight: 700, color: '#0f1f3d',
    margin: 0, fontFamily: "'Georgia',serif",
  },
  profRole:     { fontSize: 13, color: '#6b7280', margin: 0, fontWeight: 500 },
  profDeptLink: {
    fontSize: 13.5, color: '#3b82f6', fontWeight: 600,
    textDecoration: 'none', transition: 'color 0.18s',
  },
  profInstLink: {
    fontSize: 13, color: '#9ca3af', textDecoration: 'none',
    transition: 'color 0.18s',
  },
  profTagRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  profBio: {
    fontSize: 13.5, color: '#4b5563', lineHeight: 1.72, margin: 0,
  },
  profLink: {
    display: 'inline-block', padding: '9px 22px',
    background: '#f5a623', color: '#fff', borderRadius: 8,
    fontSize: 13, fontWeight: 600, textDecoration: 'none',
    transition: 'background 0.18s', alignSelf: 'flex-start',
  },

  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 20,
  },
  memberCard: {
    background: '#fff', borderRadius: 18, overflow: 'hidden',
    border: '1px solid rgba(15,31,61,0.07)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 20px 24px',
    transition: 'transform 0.35s cubic-bezier(.22,.68,0,1.2), opacity 0.45s ease, box-shadow 0.25s ease',
    position: 'relative',
  },
  memberStrip: {
    width: '100%', height: 4, marginBottom: 22,
    transition: 'opacity 0.25s',
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: '50%',
    border: '2.5px solid',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarImg: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  avatarInitials: {
    fontSize: 26, fontWeight: 700,
    fontFamily: "'Georgia',serif", lineHeight: 1,
  },
  memberName: {
    fontSize: 13.5, fontWeight: 700, color: '#0f1f3d',
    margin: '0 0 4px', textAlign: 'center', lineHeight: 1.3,
  },
  memberRoll: {
    fontSize: 11.5, color: '#9ca3af', margin: '0 0 12px',
    fontFamily: 'monospace', letterSpacing: '0.04em',
  },
  degreeBadge: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
    padding: '4px 10px', borderRadius: 20, border: '1px solid',
    textTransform: 'uppercase',
  },

  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },
  techPill: {
    background: '#fff', borderRadius: 12, padding: '14px 18px',
    border: '1px solid rgba(15,31,61,0.08)',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  techDot: {
    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
  },
  techName: {
    display: 'block', fontSize: 13.5, fontWeight: 600, color: '#1f2937',
  },
  techCat: {
    display: 'block', fontSize: 11, color: '#9ca3af',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  },

  footer: {
    textAlign: 'center', padding: '24px 40px',
    borderTop: '1px solid rgba(15,31,61,0.08)',
    fontSize: 12, color: '#9ca3af', letterSpacing: '0.04em',
  },
};
