'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

// ─── TOKENS ─────────────────────────────────────────────
const T = {
  bg: '#0A0A0A',
  card: '#141414',
  cardH: '#1A1A1A',
  border: '#1E1E1E',
  borderL: '#2A2A2A',
  text: '#E8E8E8',
  muted: '#6B6B6B',
  dim: '#444',
  gold: '#D9AF62',
  goldDim: '#D9AF6218',
  goldGlow: '#D9AF6240',
  white: '#F5F5F5',
  font: "'Red Hat Display', sans-serif",
};

// ─── ANIMATED DOT GRID ──────────────────────────────────
const DotGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const SP = 24;
    let W: number, H: number, mx = -1000, my = -1000, animId: number;

    const resize = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };

    const draw = () => {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      for (let x = SP / 2; x < W; x += SP) {
        for (let y = SP / 2; y < H; y += SP) {
          const dx = x - mx, dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / 120);
          const r = 1 + influence * 1.5;
          const alpha = 0.08 + influence * 0.35;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = influence > 0.1
            ? `rgba(217,175,98,${alpha})`
            : `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }
    };

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -1000; my = -1000; };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

// ─── INTERACTIVE DEPLOY DEMO ─────────────────────────────
const DeployDemo = () => {
  const [agentName, setAgentName] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [steps, setSteps] = useState<{ icon: string; text: string; suffix: string; delay: number }[]>([]);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const deploySteps = [
    { icon: '◆', text: 'Creating K8s namespace:', suffix: '', delay: 600 },
    { icon: '◆', text: 'Encrypting credentials via KMS...', suffix: '', delay: 1000 },
    { icon: '◆', text: 'Registering webhook tools...', suffix: '', delay: 800 },
    { icon: '◆', text: 'Starting workflow engine...', suffix: '', delay: 900 },
    { icon: '✓', text: 'Agent live at', suffix: '', delay: 700 },
  ];

  const runDeploy = useCallback(() => {
    const name = agentName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'my-agent';
    setDeploying(true);
    setSteps([]);
    setDone(false);

    const stepsWithName = [
      { ...deploySteps[0], suffix: `${name}-ns` },
      deploySteps[1],
      deploySteps[2],
      deploySteps[3],
      { ...deploySteps[4], suffix: `https://${name}.agentific.io` },
    ];

    let total = 0;
    stepsWithName.forEach((step, i) => {
      total += step.delay;
      setTimeout(() => {
        setSteps(prev => [...prev, step]);
        if (i === stepsWithName.length - 1) {
          setTimeout(() => setDone(true), 400);
        }
      }, total);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentName]);

  const reset = () => {
    setDeploying(false);
    setSteps([]);
    setDone(false);
    setAgentName('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={{
      maxWidth: 640, margin: '0 auto',
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 1px ${T.goldDim}`,
    }}>
      {/* Terminal chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 20px',
        background: T.bg,
        borderBottom: `1px solid ${T.border}`,
      }}>
        {[T.dim, T.dim, T.dim].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: T.muted, fontFamily: T.font }}>
          agentific deploy
        </div>
      </div>

      {/* Terminal body */}
      <div style={{ padding: '28px 24px', fontFamily: T.font, fontSize: 13, minHeight: 260 }}>
        {!deploying ? (
          <>
            <div style={{ color: T.muted, marginBottom: 16, fontSize: 12 }}>
              # Try it — name your agent and hit deploy
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: T.gold, userSelect: 'none', flexShrink: 0 }}>$</span>
              <span style={{ color: T.muted, flexShrink: 0 }}>agentific deploy --agent</span>
              <input
                ref={inputRef}
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && agentName.trim() && runDeploy()}
                placeholder="your-agent-name"
                autoFocus
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: T.white,
                  fontFamily: T.font,
                  fontSize: 13,
                  caretColor: T.gold,
                }}
              />
            </div>
            <button
              onClick={runDeploy}
              disabled={!agentName.trim()}
              style={{
                marginTop: 24,
                padding: '10px 24px',
                background: agentName.trim() ? T.gold : T.dim,
                color: T.bg,
                border: 'none',
                borderRadius: 6,
                fontFamily: T.font,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                cursor: agentName.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              Deploy →
            </button>
          </>
        ) : (
          <div>
            <div style={{ color: T.muted, marginBottom: 4 }}>
              <span style={{ color: T.gold }}>$</span> agentific deploy --agent {agentName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'my-agent'}
            </div>
            <br />
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  color: step.icon === '✓' ? '#6BCB77' : T.gold,
                  opacity: 0,
                  animation: 'fadeIn 0.3s ease forwards',
                  fontWeight: step.icon === '✓' ? 600 : 400,
                }}
              >
                <span style={{ marginRight: 8 }}>{step.icon}</span>
                {step.text} {step.suffix && (
                  <span style={{ color: step.icon === '✓' ? '#6BCB77' : T.white }}>{step.suffix}</span>
                )}
              </div>
            ))}
            {done && (
              <div style={{ marginTop: 24, opacity: 0, animation: 'fadeIn 0.5s ease 0.2s forwards' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px',
                  background: 'rgba(107,203,119,0.1)',
                  border: '1px solid rgba(107,203,119,0.2)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#6BCB77',
                }}>
                  Agent deployed in 4.2s — isolated, encrypted, live.
                </div>
                <button
                  onClick={reset}
                  style={{
                    display: 'block', marginTop: 16,
                    background: 'none', border: `1px solid ${T.border}`,
                    color: T.muted, padding: '8px 16px', borderRadius: 6,
                    fontFamily: T.font, fontSize: 11, cursor: 'pointer',
                    letterSpacing: 0.5,
                  }}
                >
                  Deploy another →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── WAITLIST FORM ──────────────────────────────────────
const Waitlist = ({ id = 'main', compact = false }: { id?: string; compact?: boolean }) => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);

  const submit = () => {
    if (!email || !email.includes('@') || !email.includes('.')) { setErr(true); return; }
    setDone(true);
  };

  if (done) return (
    <div style={{
      padding: '14px 24px',
      background: T.goldDim,
      border: `1px solid ${T.gold}`,
      borderRadius: 8,
      color: T.gold,
      fontFamily: T.font,
      fontSize: 14,
      textAlign: 'center',
      maxWidth: compact ? 480 : 520,
    }}>
      ✓ You&apos;re on the list. We&apos;ll be in touch.
    </div>
  );

  return (
    <div className="waitlist-row" style={{
      display: 'flex', alignItems: 'stretch',
      maxWidth: compact ? 480 : 520,
    }}>
      <input
        id={`waitlist-${id}`}
        type="email" value={email}
        onChange={e => { setEmail(e.target.value); setErr(false); }}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="you@company.com"
        style={{
          flex: 1, padding: '14px 18px',
          background: T.card,
          border: `1px solid ${err ? T.gold : T.border}`,
          borderRight: 'none',
          borderRadius: '8px 0 0 8px',
          color: T.text, fontFamily: T.font, fontSize: 14, outline: 'none',
        }}
      />
      <button onClick={submit} style={{
        padding: '14px 28px',
        background: T.gold, color: T.bg,
        fontFamily: T.font, fontSize: 12, fontWeight: 700,
        letterSpacing: 1, textTransform: 'uppercase',
        border: `1px solid ${T.gold}`,
        borderRadius: '0 8px 8px 0',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        Get Access
      </button>
    </div>
  );
};

// ─── SVG ICONS ──────────────────────────────────────────
const IconOrchestration = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconMemory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/>
    <circle cx="12" cy="14" r="2"/>
    <path d="M12 16v2"/>
  </svg>
);
const IconIntegrations = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconSecurity = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);
const IconCloud = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
  </svg>
);

// ─── PILLAR CARD ─────────────────────────────────────────
const PillarCard = ({ icon, title, desc, badge }: { icon: ReactNode; title: string; desc: string; badge: string }) => (
  <div style={{
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: '32px 28px',
    transition: 'border-color 0.3s, background 0.3s',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = T.borderL;
      e.currentTarget.style.background = T.cardH;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = T.border;
      e.currentTarget.style.background = T.card;
    }}
  >
    <div style={{
      width: 36, height: 36,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.goldDim, borderRadius: 8,
      marginBottom: 20, fontSize: 16, color: T.gold,
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: -0.3, color: T.white }}>
      {title}
    </h3>
    <p style={{ fontSize: 13, lineHeight: 1.6, color: T.muted, marginBottom: 14 }}>{desc}</p>
    <div style={{
      fontSize: 11, fontFamily: T.font, color: T.gold,
      letterSpacing: 0.5, fontWeight: 500,
    }}>
      {badge}
    </div>
  </div>
);

// ─── COMPARISON TABLE ────────────────────────────────────
const ComparisonTable = ({ items }: { items: { without: string; wit: string }[] }) => (
  <div style={{
    marginTop: 56,
    maxWidth: 800,
  }}>
    {/* Desktop: two-column table */}
    <div className="compare-desktop" style={{
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderBottom: `1px solid ${T.border}`,
        background: T.card,
      }}>
        <div style={{ padding: '14px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: T.dim }}>
          ✕ Without Agentific
        </div>
        <div style={{ padding: '14px 20px', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: T.gold, borderLeft: `1px solid ${T.border}` }}>
          ✓ With Agentific
        </div>
      </div>
      {/* Rows */}
      {items.map((c, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : 'none',
        }}>
          <div style={{ padding: '14px 20px', fontSize: 13, color: T.muted, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
            <span style={{ flexShrink: 0, color: '#555', marginTop: 1 }}>✕</span>{c.without}
          </div>
          <div style={{ padding: '14px 20px', fontSize: 13, color: T.text, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5, borderLeft: `1px solid ${T.border}` }}>
            <span style={{ flexShrink: 0, color: T.gold, marginTop: 1 }}>✓</span>{c.wit}
          </div>
        </div>
      ))}
    </div>

    {/* Mobile: paired cards */}
    <div className="compare-mobile" style={{ flexDirection: 'column', gap: 12 }}>
      {items.map((c, i) => (
        <div key={i} style={{
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', fontSize: 13, color: T.muted, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5, textDecoration: 'line-through', textDecorationColor: '#333' }}>
            <span style={{ flexShrink: 0, color: '#555', marginTop: 1, textDecoration: 'none' }}>✕</span>{c.without}
          </div>
          <div style={{ padding: '12px 16px', fontSize: 13, color: T.text, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5, background: T.card, borderTop: `1px solid ${T.border}` }}>
            <span style={{ flexShrink: 0, color: T.gold, marginTop: 1 }}>✓</span>{c.wit}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── DASHBOARD VIDEO ────────────────────────────────────
const DashboardVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const goFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if ((v as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      (v as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
    }
  };

  return (
    <div style={{
      maxWidth: 640, margin: '0 auto',
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 1px ${T.goldDim}`,
      position: 'relative',
    }}>
      <video
        ref={videoRef}
        src="/demo.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          display: 'block',
          borderRadius: 16,
        }}
      />
      <button
        onClick={goFullscreen}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: 36,
          height: 36,
          background: 'rgba(0,0,0,0.6)',
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          color: T.white,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        aria-label="Fullscreen"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
    </div>
  );
};

// ─── DEMO SECTION WITH TABS ─────────────────────────────
const DemoSection = () => {
  const [tab, setTab] = useState<'cli' | 'dashboard'>('cli');

  return (
    <section style={{
      padding: '0 48px 120px',
      position: 'relative', zIndex: 2,
      maxWidth: 1200, margin: '0 auto',
    }} className="section-pad">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="label">Try it</div>
        <h2 className="section-h2" style={{ margin: '0 auto' }}>
          Name your agent. Watch it deploy.
        </h2>

        {/* Tabs */}
        <div style={{
          display: 'inline-flex', gap: 4, marginTop: 32,
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: 4,
        }}>
          {(['cli', 'dashboard'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 24px',
                background: tab === t ? T.gold : 'transparent',
                color: tab === t ? T.bg : T.muted,
                border: 'none',
                borderRadius: 6,
                fontFamily: T.font,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'cli' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  CLI
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
                  </svg>
                  Dashboard
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'cli' ? (
        <DeployDemo />
      ) : (
        <DashboardVideo />
      )}
    </section>
  );
};

// ─── FAQ SECTION ────────────────────────────────────────
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: `1px solid ${T.border}`,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 0',
          background: 'none', border: 'none',
          color: T.white, fontFamily: T.font,
          fontSize: 16, fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
          gap: 16,
        }}
      >
        {q}
        <span style={{
          flexShrink: 0,
          color: T.gold,
          fontSize: 20,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>+</span>
      </button>
      {open && (
        <p style={{
          paddingBottom: 24,
          fontSize: 14,
          lineHeight: 1.7,
          color: T.muted,
          animation: 'fadeIn 0.2s ease',
        }}>
          {a}
        </p>
      )}
    </div>
  );
};

const FaqSection = () => {
  const faqs = [
    {
      q: 'Can I use my own framework? LangChain, CrewAI, custom Python?',
      a: 'Yes. Agentific is framework-agnostic. You bring your agent code — we handle everything else. LangChain, CrewAI, Autogen, or plain Python scripts. If it runs, we deploy it.',
    },
    {
      q: 'How is this different from just deploying on AWS or GCP myself?',
      a: 'You could — and spend weeks setting up tenant isolation, credential management, monitoring, and auto-restart. Agentific gives you all of that out of the box with a single deploy command. You focus on your agent logic, not on DevOps.',
    },
    {
      q: 'What happens with my clients\' data? Is there real isolation?',
      a: 'Each client gets their own isolated environment. Data never crosses tenant boundaries. We use namespace-level isolation, encrypted storage, and strict access controls. Built for companies that need to pass security audits.',
    },
    {
      q: 'Can my agent connect to external APIs and tools?',
      a: 'Absolutely. Our integrations layer supports REST APIs, webhooks, databases, CRMs, ERPs — anything with an endpoint. Set it up once, and your agent has access across all client instances.',
    },
    {
      q: 'What models do you support?',
      a: 'All of them. GPT-4o, Claude, Gemini, Llama, Mistral — or your own fine-tuned model. Switch models per agent or per client without changing your code.',
    },
    {
      q: 'I already have agents in production. Can I migrate?',
      a: 'Yes. Most teams migrate in under a day. We provide a CLI tool and documentation to help you move your existing agents with zero downtime. Early access users get hands-on migration support from our team.',
    },
    {
      q: 'What does pricing look like?',
      a: 'We\'re finalizing pricing with our early access cohort. Join the waitlist and we\'ll share details within 48 hours — no commitment, no credit card required.',
    },
    {
      q: 'Is this ready for production or still in beta?',
      a: 'We\'re onboarding early access users into production right now. The platform is live and handling real workloads. Early access means you get priority support and input on the roadmap.',
    },
  ];

  return (
    <section className="section-pad" style={{
      borderTop: `1px solid ${T.border}`,
      position: 'relative', zIndex: 2,
      maxWidth: 1200, margin: '0 auto',
    }}>
      <div className="label">FAQ</div>
      <h2 className="section-h2">Questions you probably have.</h2>
      <div style={{ marginTop: 48, maxWidth: 720 }}>
        {faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>
    </section>
  );
};

// ─── MAIN ────────────────────────────────────────────────
export default function AgentificLanding() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pillars = [
    { icon: <IconOrchestration />, title: 'Orchestration', desc: 'Your agent follows a clear, repeatable process every time. No guessing, no random failures — just reliable multi-step execution.', badge: 'Deterministic multi-step flows' },
    { icon: <IconMemory />, title: 'Memory', desc: 'Your agent remembers past conversations and learns from each interaction. Short-term and long-term context that makes every response smarter.', badge: 'Persistent context per session' },
    { icon: <IconIntegrations />, title: 'Integrations', desc: 'Connect your agent to the tools your business already uses — CRMs, ERPs, APIs, webhooks, databases. One config, instant access.', badge: 'APIs, webhooks & data sources' },
    { icon: <IconSecurity />, title: 'Security', desc: 'Your clients\' data stays protected. Encrypted at rest and in transit, with anti-prompt-injection and compliance controls built in.', badge: 'Encryption + compliance ready' },
    { icon: <IconCloud />, title: 'Hosting', desc: 'We handle the infrastructure so you don\'t have to. Cloud or on-premise — deployed where your client needs it, scaled automatically.', badge: 'Cloud or on-premise' },
  ];

  const comparisons = [
    { without: 'Months configuring K8s per client', wit: 'Isolated namespace in seconds' },
    { without: 'Credentials in .env files you maintain', wit: 'KMS-encrypted vault, managed' },
    { without: 'LLM orchestrating workflows — 50%+ failure', wit: 'Deterministic Python engine' },
    { without: 'No tenant isolation between clients', wit: 'Namespace-level isolation per tenant' },
    { without: 'Build your own monitoring & audit logs', wit: 'Observability out of the box' },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: T.font }}>
      <DotGrid />

      {/* ─── NAV ──────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 10 ? `${T.bg}ee` : 'transparent',
        backdropFilter: scrollY > 10 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 10 ? `1px solid ${T.border}` : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div className="nav-inner" style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 48px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="https://storage.googleapis.com/darwin-magic-images/images/general/1774503113296-acfc42f5-665a-4087-bfd0-e7215cb44e6e.webp"
              alt="Agentific"
              style={{ height: 30, width: 'auto' }}
            />
          </a>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['Platform', '#platform'], ['Use Cases', '#use-cases']].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>{l}</a>
            ))}
          </div>
          <a href="#access" style={{
            padding: '9px 20px',
            background: T.gold, color: T.bg,
            fontSize: 12, fontWeight: 700,
            letterSpacing: 0.5,
            borderRadius: 6,
            textDecoration: 'none',
          }}>
            Get Early Access
          </a>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="hero-section" style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '120px 48px 80px',
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px',
          background: T.goldDim,
          border: '1px solid rgba(217,175,98,0.15)',
          borderRadius: 100,
          fontSize: 12, color: T.gold, fontWeight: 500,
          width: 'fit-content',
          marginBottom: 32,
          animation: 'slideUp 0.8s ease',
        }}>
          <span style={{
            width: 6, height: 6,
            background: T.gold, borderRadius: '50%',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          Accepting early access applications
        </div>

        <h1 className="hero-h1">
          Everything your agent needs to{' '}
          <em style={{
            fontStyle: 'italic',
            background: `linear-gradient(90deg, ${T.gold}, #F0D78C, ${T.gold})`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4s linear infinite',
          }}>
            go live.
          </em>
        </h1>

        <p className="hero-sub">
          Secure, multi-tenant hosting for AI agents. Encrypted credentials,
          deterministic workflows, and full observability — ready in minutes.
        </p>

        <div style={{ marginTop: 40, animation: 'slideUp 0.8s ease 0.2s both' }}>
          <Waitlist id="hero" />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 28,
          marginTop: 24, fontSize: 12, color: T.dim,
          fontFamily: T.font, flexWrap: 'wrap',
          animation: 'slideUp 0.8s ease 0.3s both',
        }}>
          {['Multi-tenant K8s', 'KMS encryption', 'SOC 2 in progress'].map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: T.gold, fontSize: 10 }}>●</span> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO ──────────────────────────── */}
      <DemoSection />

      {/* ─── BEFORE / AFTER ───────────────────────────── */}
      <section id="platform" className="section-pad" style={{
        borderTop: `1px solid ${T.border}`,
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div className="label">Why Agentific</div>
        <h2 className="section-h2">Stop building infra.<br />Start shipping agents.</h2>

        <ComparisonTable items={comparisons} />
      </section>

      {/* ─── PLATFORM PILLARS ──────────────────────────── */}
      <section className="section-pad" style={{
        borderTop: `1px solid ${T.border}`,
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div className="label">Platform</div>
        <h2 className="section-h2">Five layers. One deploy command.</h2>

        <div className="pillar-grid">
          {pillars.map((p, i) => (
            <PillarCard key={i} icon={p.icon} title={p.title} desc={p.desc} badge={p.badge} />
          ))}
          <div style={{
            background: T.card,
            border: `1px dashed ${T.border}`,
            borderRadius: 12,
            padding: '32px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontSize: 20, color: T.dim }}>+</span>
            <p style={{ fontSize: 13, color: T.muted, textAlign: 'center' }}>
              More coming.<br />
              <a href="#access" style={{ color: T.gold, textDecoration: 'none' }}>Join waitlist →</a>
            </p>
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─────────────────────────────────── */}
      <section id="use-cases" className="section-pad" style={{
        borderTop: `1px solid ${T.border}`,
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div className="label">Built for</div>
        <h2 className="section-h2">Developers who ship agents, not infra.</h2>

        <div className="audience-grid">
          {[
            {
              tag: 'Agent-first startups',
              line: 'Your product IS an AI agent — legal AI, sales copilot, support bot. Deploy it to 50 clients without managing Kubernetes.',
            },
            {
              tag: 'SaaS adding AI',
              line: 'Your product works great. Now add agent capabilities without rebuilding your entire backend.',
            },
            {
              tag: 'Enterprise teams',
              line: 'Multiple agents across departments — secure, audited, compliant. No shadow AI.',
            },
          ].map(c => (
            <div key={c.tag} style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: '32px 28px',
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.borderL}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 2,
                textTransform: 'uppercase', color: T.gold, marginBottom: 16,
              }}>
                {c.tag}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: T.text }}>{c.line}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────── */}
      <FaqSection />

      {/* ─── TRUST BAR ────────────────────────────────── */}
      <div className="trust-bar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 40, padding: '28px 48px',
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        fontSize: 12, color: T.dim,
        fontFamily: T.font,
        flexWrap: 'wrap',
        position: 'relative', zIndex: 2,
      }}>
        {['GKE', 'Cloud SQL', 'KMS Encryption', 'Multi-tenant Isolation', 'SOC 2 in progress'].map(t => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: T.gold, fontSize: 8 }}>●</span> {t}
          </span>
        ))}
      </div>

      {/* ─── FINAL CTA ────────────────────────────────── */}
      <section id="access" className="section-pad" style={{
        textAlign: 'center',
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: 800,
          letterSpacing: -3,
          marginBottom: 16,
        }}>
          Deploy your first agent.
        </h2>
        <p style={{
          fontSize: 15, color: T.muted,
          maxWidth: 400, margin: '0 auto 40px',
          lineHeight: 1.6,
        }}>
          We&apos;re onboarding a small group of developers building production AI agents.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Waitlist id="cta" compact />
        </div>
        <p style={{ marginTop: 14, fontSize: 11, color: T.dim }}>No spam. No BS.</p>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${T.border}`,
        position: 'relative', zIndex: 2,
      }}>
        <div className="footer-inner" style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '28px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, color: T.dim, flexWrap: 'wrap', gap: 16,
        }}>
          <span>© 2026 Agentific Inc.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="/privacy" style={{ color: T.dim, textDecoration: 'none' }}>Privacy</a>
            <a href="/terms" style={{ color: T.dim, textDecoration: 'none' }}>Terms</a>
            <a href="mailto:hello@agentific.io" style={{ color: T.dim, textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
