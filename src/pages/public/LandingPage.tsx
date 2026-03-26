import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrambledText from '@/components/ScrambledText';
import DotGrid from '@/components/DotGrid';
import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { BarChart3, ShieldCheck, Utensils, HeartPulse, Flame, Beef, Wheat, Droplets, School, Users, FileText } from 'lucide-react';

// ─── DATA ───────────────────────────────────────────────────────────
const CARDS = [
  { img: '/images/card-1.png', badge: '' },
  { img: '/images/card-2.jpg', badge: '' },
  { img: '/images/card-3.jpg', badge: '' },
];

const COL_SETUP = [
  { indices: [0, 1, 2], dir: 'up' as const, speed: 0.5 },
  { indices: [2, 0, 1], dir: 'down' as const, speed: 0.45 },
];

const CARD_H = 185;

const weeklyMenu = [
  { minggu: 'Mg 1', kalori: 680, protein: 28 },
  { minggu: 'Mg 2', kalori: 710, protein: 31 },
  { minggu: 'Mg 3', kalori: 695, protein: 29 },
  { minggu: 'Mg 4', kalori: 730, protein: 34 },
  { minggu: 'Mg 5', kalori: 718, protein: 32 },
  { minggu: 'Mg 6', kalori: 745, protein: 36 },
];

const kasusPerBulan = [
  { bulan: 'Sep', kasus: 8 }, { bulan: 'Okt', kasus: 12 }, { bulan: 'Nov', kasus: 10 },
  { bulan: 'Des', kasus: 15 }, { bulan: 'Jan', kasus: 18 }, { bulan: 'Feb', kasus: 14 }, { bulan: 'Mar', kasus: 6 },
];

const radarData = [
  { subject: 'Kalori', A: 85 }, { subject: 'Protein', A: 78 }, { subject: 'Karbohidrat', A: 90 },
  { subject: 'Lemak', A: 72 }, { subject: 'Serat', A: 65 }, { subject: 'Vitamin', A: 80 },
];

const trendGizi = [
  { bulan: 'Sep', skor: 72 }, { bulan: 'Okt', skor: 75 }, { bulan: 'Nov', skor: 74 },
  { bulan: 'Des', skor: 78 }, { bulan: 'Jan', skor: 80 }, { bulan: 'Feb', skor: 83 }, { bulan: 'Mar', skor: 86 },
];

// ─── MARQUEE COLUMN ──────────────────────────────────────────────────
const MarqueeCol: React.FC<{ indices: number[]; dir: 'up' | 'down'; speed: number }> = ({ indices, dir, speed }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(dir === 'down' ? -(indices.length * CARD_H) : 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const totalH = indices.length * CARD_H;
    const animate = () => {
      if (dir === 'up') {
        posRef.current -= speed;
        if (posRef.current <= -totalH) posRef.current += totalH;
      } else {
        posRef.current += speed;
        if (posRef.current >= 0) posRef.current -= totalH;
      }
      track.style.transform = `translateY(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dir, speed, indices.length]);

  const items = indices.map(i => CARDS[i]);
  const tripled = [...items, ...items, ...items];

  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <div ref={trackRef} style={{ display: 'flex', flexDirection: 'column', gap: 10, willChange: 'transform' }}>
        {tripled.map((card, i) => (
          <div key={i} style={{
            height: 175, borderRadius: 14, flexShrink: 0, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12,
            backgroundImage: `url(${card.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.05) 60%,transparent)' }} />
            {card.badge && <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>{card.badge}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── COUNT UP (DOM ref style) ─────────────────────────────────────────
const useCountUp = (end: number) => {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let cur = 0;
      const step = end / (1800 / 16);
      const t = setInterval(() => {
        cur += step;
        if (cur >= end) { el.textContent = end.toLocaleString('id-ID'); clearInterval(t); }
        else el.textContent = Math.floor(cur).toLocaleString('id-ID');
      }, 16);
      obs.disconnect();
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return ref;
};

// ─── COUNT UP (state style) ───────────────────────────────────────────
const CountUpStat: React.FC<{ end: number; suffix?: string }> = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const step = end / (1800 / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', color: '#fff', lineHeight: 1 }}>
      {count.toLocaleString('id-ID')}{suffix}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const bannerRef = useCountUp(1645);
  const s1Ref = useCountUp(30);
  const s2Ref = useCountUp(2967);

  const N = { fontFamily: "'Nunito', sans-serif" };

  const features = [
    { icon: BarChart3,  title: 'Dashboard Real-time',    desc: 'Pantau statistik gizi dan laporan secara langsung dengan data terupdate.',           color: '#E8334A', bg: '#FFF0F2', num: '01', to: '/' },
    { icon: ShieldCheck, title: 'Pelaporan Transparan',  desc: 'Laporkan masalah makanan dengan mudah dan pantau status tindak lanjutnya.',           color: '#2D6A4F', bg: '#EDFAF3', num: '02', to: '/monitoring-kasus' },
    { icon: Utensils,   title: 'Monitoring Menu',        desc: 'Lihat menu harian setiap sekolah beserta informasi nutrisi lengkap.',                  color: '#c9a000', bg: '#FFFBEA', num: '03', to: '/menu-sekolah' },
    { icon: HeartPulse, title: 'AI Scanner Gizi',        desc: 'Analisis kandungan gizi makanan dengan teknologi kecerdasan buatan.',                  color: '#8B0000', bg: '#FFF5F5', num: '04', to: '/ai-scanner' },
  ];

  const statCards = [
    { icon: Flame,    label: 'Rata-rata Kalori',        value: '718 kcal', trend: '+3.2% dari minggu lalu', up: true },
    { icon: Beef,     label: 'Rata-rata Protein',       value: '32g',      trend: '+5.1%',                  up: true },
    { icon: Wheat,    label: 'Rata-rata Karbohidrat',   value: '87g',      trend: '-1.2%',                  up: false },
    { icon: Droplets, label: 'Rata-rata Lemak',         value: '22g',      trend: '+0.8%',                  up: true },
  ];

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&family=Sora:wght@400;600;700&display=swap');
        .mbg-cta:hover  { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.25); }
        .mbg-check:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,51,74,0.4); }
        .mbg-ftlink:hover { color: #fff !important; }
        .feat-card { transition: transform .22s, box-shadow .22s, border-color .22s; cursor: pointer; }
        .feat-card:hover { transform: translateY(-6px); }
        .stat-mini { transition: transform .2s, box-shadow .2s; }
        .stat-mini:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
        .chart-card { border-radius: 20px; background: #fff; border: 1.5px solid #f0f0f0; padding: 1.5rem; }

        /* ── RESPONSIVE BREAKPOINTS ── */

        /* Hero section */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #E8334A;
          overflow: hidden;
        }
        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 2.5rem 3rem 3rem;
        }
        .hero-right {
          display: flex;
          gap: 10px;
          padding: 1.2rem 1.2rem 1.2rem 4rem;
          overflow: hidden;
          height: 100vh;
          transform: rotate(-5deg) scale(1.1);
          transform-origin: center center;
        }
        .hero-cta-row {
          display: flex;
          gap: 12px;
        }

        /* Dampak section */
        .dampak-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        /* Fitur section */
        .fitur-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.1rem;
        }

        /* Dashboard stat mini cards */
        .stat-mini-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        /* Chart rows */
        .chart-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .chart-row-last {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        /* Stats banner */
        .stats-banner {
          background: #E8334A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 3.5rem;
        }

        /* Photo stats grid */
        .photo-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem 5rem;
          margin-bottom: 2.5rem;
        }

        /* ── TABLET (≤ 900px) ── */
        @media (max-width: 900px) {
          .hero-section {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .hero-left {
            padding: 2.5rem 1.5rem;
            order: 1;
          }
          .hero-right {
            height: 280px;
            padding: 1rem;
            transform: rotate(0deg) scale(1);
            order: 0;
          }
          .dampak-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .fitur-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat-mini-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .chart-row,
          .chart-row-last {
            grid-template-columns: 1fr;
          }
          .stats-banner {
            padding: 1rem 1.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .photo-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem 2rem;
          }
        }

        /* ── MOBILE (≤ 600px) ── */
        @media (max-width: 600px) {
          .hero-section {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .hero-left {
            padding: 2rem 1.2rem 1.5rem;
            order: 1;
          }
          .hero-right {
            height: 220px;
            padding: 0.75rem;
            transform: rotate(0deg) scale(1);
            order: 0;
          }
          .hero-cta-row {
            flex-direction: column;
            gap: 10px;
          }
          .dampak-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .fitur-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem;
          }
          .stat-mini-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }
          .chart-row,
          .chart-row-last {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          .chart-card {
            padding: 1rem;
          }
          .stats-banner {
            padding: 1rem 1.2rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.4rem;
          }
          .photo-stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.2rem 1.5rem;
          }
        }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-left">
          <h1 style={{ ...N, fontSize: 'clamp(1.8rem,3.5vw,3.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '1.2rem' }}>
            <ScrambledText className="scrambled-text-demo" radius={100} duration={1.2} speed={0.5} scrambleChars=".:">
              Pantau Program Makan <br /> Bergizi Gratis<br />
              Secara Akurat Melalui <br /> Jemari Anda
            </ScrambledText>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.82rem', lineHeight: 1.75, maxWidth: 400, marginBottom: '2rem', textAlign: 'justify' }}>
            Platform kami menyediakan informasi seputar statistik gizi, penerima dan waste harian dari program MBG yang dilaksanakan oleh Badan Gizi Nasional
          </p>
          <div className="hero-cta-row">
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("openChatbot", { detail: "lapor" }));
              }}
              className="mbg-cta"
              style={{
                flex: 1,
                borderRadius: 18,
                padding: '1rem 1.2rem',
                background: '#2D6A4F',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 130,
                transition: 'transform .2s, box-shadow .2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 28, height: 28, background: 'rgba(255,255,255,0.25)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 4
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, lineHeight: 1.4 }}>
                Terdapat keluhan?<br />Segera Laporkan!
              </p>
              <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginTop: 'auto' }}>Laporan</p>
              <span style={{ fontSize: '2rem', position: 'absolute', bottom: 8, right: 10 }}>🌮</span>
            </Link>
            <Link to="/monitoring-kasus" className="mbg-cta" style={{
              flex: 1, borderRadius: 18, padding: '1rem 1.2rem', background: '#F4C430',
              display: 'flex', flexDirection: 'column', gap: 4, textDecoration: 'none',
              position: 'relative', overflow: 'hidden', minHeight: 130, transition: 'transform .2s, box-shadow .2s'
            }}>
              <div style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.65)', fontWeight: 600, lineHeight: 1.4 }}>Penasaran dengan<br />data sisa makanan?</p>
              <p style={{ ...N, fontSize: '1.4rem', fontWeight: 900, color: '#111', lineHeight: 1.1, marginTop: 'auto' }}>Waste<br />Monitoring</p>
              <span style={{ fontSize: '2rem', position: 'absolute', bottom: 8, right: 10 }}>🍵</span>
            </Link>
          </div>
        </div>

        <div className="hero-right">
          {COL_SETUP.map((col, i) => <MarqueeCol key={i} {...col} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION: DAMPAK NYATA PROGRAM MBG
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', position: 'relative', overflow: 'hidden', background: '#E8334A' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <DotGrid
            dotSize={6} gap={10} baseColor="#e7e3ed" activeColor="#d93a3a"
            proximity={120} shockRadius={250} shockStrength={5} resistance={750} returnDuration={1.5}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: '#E8334A', opacity: 0.85, zIndex: 1 }} />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ ...N, fontWeight: 900, color: '#fff', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', lineHeight: 1.15, margin: 0 }}>
              Dampak Nyata<br />Program MBG
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.86rem', marginTop: '0.6rem' }}>
              Data terupdate secara real-time dari seluruh Indonesia
            </p>
          </div>

          <div className="dampak-grid">
            {[
              { emoji: '🏫', label: 'Sekolah Penerima', end: 12450, suffix: '' },
              { emoji: '👧', label: 'Siswa Penerima', end: 3200000, suffix: '+' },
              { emoji: '📋', label: 'Total Laporan Warga', end: 8920, suffix: '' },
            ].map((s, i) => (
              <div key={i} style={{
                borderRadius: 20, padding: '2rem 1.5rem', textAlign: 'center',
                background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', margin: '0 auto 1rem',
                  background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>
                  {s.emoji}
                </div>
                <CountUpStat end={s.end} suffix={s.suffix} />
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: '0.4rem' }}>
                  {s.label}
                </p>
                <div style={{ height: 3, borderRadius: 99, width: '50%', margin: '1.2rem auto 0', background: 'rgba(255,255,255,0.35)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION: FITUR UNGGULAN
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF0F2', border: '1.5px solid #E8334A', borderRadius: 99, padding: '5px 16px', marginBottom: '1rem' }}>
              <span style={{ ...N, fontWeight: 900, color: '#E8334A', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Fitur Unggulan</span>
            </div>
            <h2 style={{ ...N, fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: '#1a1a2e', lineHeight: 1.2, margin: 0 }}>
              Semua yang Anda Butuhkan
            </h2>
            <p style={{ color: '#888', fontSize: '0.86rem', marginTop: '0.5rem', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
              Satu platform lengkap untuk monitoring, pelaporan, dan analisis program MBG
            </p>
          </div>

          <div className="fitur-grid">
            {features.map((f, i) => (
              <Link key={i} to={f.to} className="feat-card" style={{
                borderRadius: 20, padding: '1.75rem 1.4rem',
                background: '#fff', border: `1.5px solid #f0f0f0`,
                position: 'relative', overflow: 'hidden', textDecoration: 'none', display: 'block',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = f.color;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px ${f.color}28`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <span style={{
                  position: 'absolute', top: 12, right: 14,
                  ...N, fontWeight: 900, fontSize: '1.15rem',
                  color: f.bg, WebkitTextStroke: `1.5px ${f.color}40`,
                  userSelect: 'none', letterSpacing: '-0.02em',
                }}>{f.num}</span>
                <div style={{
                  width: 46, height: 46, borderRadius: 13,
                  background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem', transition: 'transform .2s',
                }}>
                  <f.icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <p style={{ ...N, fontWeight: 800, fontSize: '0.92rem', color: '#1a1a2e', marginBottom: '0.4rem' }}>{f.title}</p>
                <p style={{ fontSize: '0.76rem', color: '#888', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: f.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.2rem',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION: DASHBOARD PUBLIK – STATISTIK MBG
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF0F2', border: '1.5px solid #E8334A', borderRadius: 99, padding: '5px 16px', marginBottom: '1rem' }}>
              <span style={{ ...N, fontWeight: 900, color: '#E8334A', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Dashboard Publik</span>
            </div>
            <h2 style={{ ...N, fontWeight: 900, fontSize: 'clamp(1.6rem,3vw,2.5rem)', color: '#1a1a2e', lineHeight: 1.2, margin: 0 }}>
              Statistik Program MBG
            </h2>
            <p style={{ color: '#888', fontSize: '0.86rem', marginTop: '0.5rem' }}>Data gizi dan monitoring secara real-time</p>
          </div>

          <div className="stat-mini-grid">
            {statCards.map((s, i) => (
              <div key={i} className="stat-mini" style={{ background: '#fff', borderRadius: 16, padding: '1.2rem', border: '1.5px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon style={{ width: 17, height: 17, color: '#E8334A' }} />
                  </div>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: s.up ? '#2D6A4F' : '#E8334A', background: s.up ? '#EDFAF3' : '#FFF0F2', padding: '2px 8px', borderRadius: 99 }}>
                    {s.trend}
                  </span>
                </div>
                <div style={{ ...N, fontWeight: 900, fontSize: '1.35rem', color: '#1a1a2e', lineHeight: 1 }}>{s.value}</div>
                <p style={{ fontSize: '0.73rem', color: '#888', fontWeight: 600, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="chart-row">
            <div className="chart-card" style={{ borderTop: '3px solid #E8334A' }}>
              <p style={{ ...N, fontWeight: 800, fontSize: '0.9rem', color: '#1a1a2e', margin: '0 0 2px' }}>Distribusi Menu per Minggu</p>
              <p style={{ fontSize: '0.73rem', color: '#aaa', margin: '0 0 1rem' }}>Kalori dan protein dalam 6 minggu terakhir</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyMenu}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="minggu" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="kalori" fill="#E8334A" radius={[6, 6, 0, 0]} name="Kalori" />
                  <Bar dataKey="protein" fill="#2D6A4F" radius={[6, 6, 0, 0]} name="Protein" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" style={{ borderTop: '3px solid #2D6A4F' }}>
              <p style={{ ...N, fontWeight: 800, fontSize: '0.9rem', color: '#1a1a2e', margin: '0 0 2px' }}>Tren Skor Kualitas Gizi</p>
              <p style={{ fontSize: '0.73rem', color: '#aaa', margin: '0 0 1rem' }}>Peningkatan kualitas gizi rata-rata nasional</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendGizi}>
                  <defs>
                    <linearGradient id="giziGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" fontSize={11} />
                  <YAxis fontSize={11} domain={[60, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="skor" stroke="#2D6A4F" fill="url(#giziGrad)" strokeWidth={2.5} name="Skor Gizi" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-row-last">
            <div className="chart-card" style={{ borderTop: '3px solid #8B0000' }}>
              <p style={{ ...N, fontWeight: 800, fontSize: '0.9rem', color: '#1a1a2e', margin: '0 0 2px' }}>Laporan Kasus per Bulan</p>
              <p style={{ fontSize: '0.73rem', color: '#aaa', margin: '0 0 1rem' }}>Jumlah laporan masuk dari warga</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={kasusPerBulan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bulan" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }} />
                  <Line type="monotone" dataKey="kasus" stroke="#E8334A" strokeWidth={2.5} dot={{ r: 5, fill: '#E8334A', strokeWidth: 2, stroke: '#fff' }} name="Kasus" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card" style={{ borderTop: '3px solid #F4C430' }}>
              <p style={{ ...N, fontWeight: 800, fontSize: '0.9rem', color: '#1a1a2e', margin: '0 0 2px', textAlign: 'center' }}>Kualitas Gizi Keseluruhan</p>
              <p style={{ fontSize: '0.73rem', color: '#aaa', margin: '0 0 1rem', textAlign: 'center' }}>Skor pemenuhan standar nutrisi</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f0f0f0" />
                  <PolarAngleAxis dataKey="subject" fontSize={11} />
                  <Radar name="Skor" dataKey="A" stroke="#E8334A" fill="#E8334A" fillOpacity={0.15} strokeWidth={2.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ──────────────────────────────────────────── */}
      <div className="stats-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0.1, 0.2].map((op, i) => (
              <div key={i} style={{ width: 0, height: 0, borderTop: '22px solid transparent', borderBottom: '22px solid transparent', borderLeft: `18px solid rgba(255,255,255,${op})` }} />
            ))}
          </div>
          <span style={{ ...N, fontSize: 'clamp(1rem, 3vw, 1.4rem)', fontWeight: 900, color: '#fff' }}>Jumlah Total Laporan</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...N, fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            <span ref={bannerRef as React.RefObject<HTMLSpanElement>}>0</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', fontWeight: 600 }}>Laporan</div>
        </div>
      </div>

      {/* ── PHOTO STATS ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/bg-siswa.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.75) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(255,255,255,0.72) 0%,rgba(255,255,255,0.38) 40%,rgba(255,255,255,0.72) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '3rem 2rem' }}>
          <div className="photo-stats-grid">
            {[{ ref: s1Ref, label: 'Jumlah Sekolah\nPenerima MBG' }, { ref: s2Ref, label: 'Total Jumlah\nSiswa Penerima' }].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <span ref={item.ref as React.RefObject<HTMLSpanElement>} style={{ ...N, fontSize: 'clamp(2.2rem,5vw,4.5rem)', fontWeight: 900, color: '#1a1a2e', display: 'block', lineHeight: 1 }}>0</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a2e', marginTop: 4, lineHeight: 1.35, whiteSpace: 'pre-line' }}>{item.label}</p>
              </div>
            ))}
          </div>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("openChatbot", { detail: "lapor" }));
            }}
            className="mbg-check"
            style={{
              display: 'inline-block', background: '#E8334A', color: '#fff',
              fontWeight: 800, fontSize: '0.95rem', padding: '.85rem 2.2rem',
              borderRadius: 50, textDecoration: 'none', transition: 'transform .2s, box-shadow .2s'
            }}
          >
            Laporkan Masalah Anda !
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;