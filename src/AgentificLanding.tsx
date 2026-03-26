import { useState, useEffect, useRef, useCallback, type FC, type FormEvent } from 'react';

// ─── TYPES ───────────────────────────────────────────────
interface TerminalLine {
  content: React.ReactNode;
  delay: number;
}

interface Pillar {
  num: string;
  icon: string;
  title: string;
  description: string;
  highlight: string;
}

interface AudienceCard {
  type: string;
  title: string;
  description: string;
  quote: string;
}

interface ComparisonItem {
  icon: string;
  text: string;
}

type DeployMode = 'cli' | 'ui';

// ─── STYLES (CSS-in-JS object) ──────────────────────────
// Import in your layout/page:
// <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

const CSS_VARS = {
  bg: '#08090b',
  bgElevated: '#0f1114',
  bgCard: '#13151a',
  bgCardHover: '#1a1d24',
  border: '#1e2028',
  borderAccent: '#2a2d38',
  textPrimary: '#e8e9ed',
  textSecondary: '#8b8d98',
  textMuted: '#5c5e6a',
  accent: '#ffffff',
  accentDim: '#ffffff10',
  accentGlow: '#ffffff20',
  red: '#e63946',
  redDim: '#e6394615',
  redGlow: '#e6394630',
  fontDisplay: "'Outfit', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
} as const;

// ─── DOT GRID CANVAS COMPONENT ──────────────────────────
const DotGrid: FC = () => {
  const glowRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const glowC = glowRef.current;
    const maskC = maskRef.current;
    if (!glowC || !maskC) return;

    const gCtx = glowC.getContext('2d')!;
    const mCtx = maskC.getContext('2d')!;

    const DOT_R = 1.5;
    const SPACING = 22;
    const FADE_DELAY = 120;

    let W = window.innerWidth;
    let H = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    let mx = W / 2, my = H / 2;
    let tx = W / 2, ty = H / 2;
    let brightness = 0, scale = 0;
    let lastMove = 0;
    let animId: number;

    const drawMask = () => {
      mCtx.clearRect(0, 0, W, H);
      mCtx.fillStyle = CSS_VARS.bg;
      mCtx.fillRect(0, 0, W, H);
      mCtx.globalCompositeOperation = 'destination-out';
      for (let x = SPACING / 2; x < W; x += SPACING) {
        for (let y = SPACING / 2; y < H; y += SPACING) {
          mCtx.beginPath();
          mCtx.arc(x, y, DOT_R, 0, Math.PI * 2);
          mCtx.fillStyle = 'rgba(0,0,0,1)';
          mCtx.fill();
        }
      }
      mCtx.globalCompositeOperation = 'source-over';
    };

    const resize = () => {
      W = window.innerWidth;
      H = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      glowC.width = maskC.width = W;
      glowC.height = maskC.height = H;
      drawMask();
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const drawGlow = (x: number, y: number, b: number, sc: number) => {
      gCtx.clearRect(0, 0, W, H);
      if (b <= 0.01) return;
      const maxR = 150 * sc;
      const midR = maxR * 0.35;
      const coreR = maxR * 0.08;

      let g = gCtx.createRadialGradient(x, y, midR * 0.5, x, y, maxR);
      g.addColorStop(0, `rgba(200,210,240,${b * 0.15})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = g;
      gCtx.fillRect(0, 0, W, H);

      g = gCtx.createRadialGradient(x, y, coreR, x, y, midR);
      g.addColorStop(0, `rgba(255,255,255,${b * 0.5})`);
      g.addColorStop(0.5, `rgba(210,220,245,${b * 0.2})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = g;
      gCtx.fillRect(0, 0, W, H);

      g = gCtx.createRadialGradient(x, y, 0, x, y, coreR);
      g.addColorStop(0, `rgba(255,255,255,${b * 0.8})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      gCtx.fillStyle = g;
      gCtx.fillRect(0, 0, W, H);
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      tx = lerp(tx, mx, 0.1);
      ty = lerp(ty, my, 0.1);
      const moving = performance.now() - lastMove < FADE_DELAY;
      brightness = lerp(brightness, moving ? 1 : 0, moving ? 0.06 : 0.04);
      scale = lerp(scale, moving ? 1 : 0, moving ? 0.05 : 0.04);
      drawGlow(tx, ty, brightness, scale);
    };

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY + window.scrollY;
      lastMove = performance.now();
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    pointerEvents: 'none',
  };

  return (
    <>
      <canvas ref={glowRef} style={{ ...canvasStyle, zIndex: 0 }} />
      <canvas ref={maskRef} style={{ ...canvasStyle, zIndex: 1 }} />
    </>
  );
};

// ─── TERMINAL COMPONENT ──────────────────────────────────
const Terminal: FC = () => {
  const lines: TerminalLine[] = [
    { content: <span style={{ color: CSS_VARS.textMuted }}># Your agent code. Your model. Your tools.</span>, delay: 0.8 },
    { content: <><span style={{ color: CSS_VARS.textMuted, userSelect: 'none' }}>$ </span><span style={{ color: CSS_VARS.textSecondary }}>agentific deploy</span> <span style={{ color: CSS_VARS.accentGlow.replace('20', 'ad') }}>--agent</span> <span style={{ color: CSS_VARS.accent }}>./my-agent</span> <span style={{ color: CSS_VARS.accentGlow.replace('20', 'ad') }}>--brand</span> <span style={{ color: CSS_VARS.accent }}>acme-corp</span></>, delay: 1.2 },
    { content: <br />, delay: 1.6 },
    { content: <span style={{ color: CSS_VARS.textMuted, fontStyle: 'italic' }}>⠋ Provisioning isolated namespace...</span>, delay: 2.4 },
    { content: <span style={{ color: CSS_VARS.textMuted, fontStyle: 'italic' }}>⠋ Encrypting credentials via KMS...</span>, delay: 2.8 },
    { content: <span style={{ color: CSS_VARS.textMuted, fontStyle: 'italic' }}>⠋ Registering webhook tools...</span>, delay: 3.2 },
    { content: <span style={{ color: CSS_VARS.textMuted, fontStyle: 'italic' }}>⠋ Starting workflow engine...</span>, delay: 3.8 },
    { content: <br />, delay: 4.4 },
    { content: <span style={{ color: CSS_VARS.red }}>✓ Agent live at https://acme-corp.agentific.io</span>, delay: 5.0 },
  ];

  return (
    <section style={{ padding: '0 40px 100px', position: 'relative', zIndex: 2 }}>
      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        background: CSS_VARS.bgElevated,
        border: `1px solid ${CSS_VARS.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 18px',
          background: CSS_VARS.bgCard,
          borderBottom: `1px solid ${CSS_VARS.border}`,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: CSS_VARS.borderAccent }} />
          ))}
          <div style={{ flex: 1, textAlign: 'center', fontFamily: CSS_VARS.fontMono, fontSize: 12, color: CSS_VARS.textMuted }}>
            deploy-agent.sh
          </div>
        </div>
        <div style={{ padding: 24, fontFamily: CSS_VARS.fontMono, fontSize: 13, lineHeight: 1.8 }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              opacity: 0,
              animation: `termLine 0.3s ease-out ${line.delay}s forwards`,
            }}>
              {line.content}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── WAITLIST FORM COMPONENT ─────────────────────────────
const WaitlistInline: FC<{ id: string }> = ({ id }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!email || !email.includes('@')) {
      setError(true);
      return;
    }
    setSubmitted(true);
    // TODO: Replace with actual API call
    console.log(`Waitlist signup (${id}):`, email);
  }, [email, id]);

  if (submitted) {
    return (
      <div style={{
        padding: '14px 24px',
        background: CSS_VARS.accentDim,
        border: `1px solid ${CSS_VARS.accent}`,
        borderRadius: 8,
        color: CSS_VARS.accent,
        fontFamily: CSS_VARS.fontMono,
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 520,
        marginTop: 40,
      }}>
        ✓ You&apos;re on the list. We&apos;ll be in touch.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 40, maxWidth: 520 }}>
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(false); }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="you@company.com"
        style={{
          flex: 1,
          padding: '14px 18px',
          background: CSS_VARS.bgCard,
          border: `1px solid ${error ? '#888' : CSS_VARS.border}`,
          borderRight: 'none',
          borderRadius: '8px 0 0 8px',
          color: CSS_VARS.textPrimary,
          fontFamily: CSS_VARS.fontMono,
          fontSize: 14,
          outline: 'none',
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: '14px 28px',
          background: CSS_VARS.accent,
          color: CSS_VARS.bg,
          fontFamily: CSS_VARS.fontMono,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
          border: `1px solid ${CSS_VARS.accent}`,
          borderRadius: '0 8px 8px 0',
          cursor: 'pointer',
          whiteSpace: 'nowrap' as const,
        }}
      >
        Join Waitlist
      </button>
    </div>
  );
};

// ─── CTA FORM COMPONENT ─────────────────────────────────
const CtaForm: FC = () => {
  const [email, setEmail] = useState('');
  const [agent, setAgent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!email || !email.includes('@')) {
      setError(true);
      return;
    }
    setSubmitted(true);
    console.log('Early access:', email, agent);
  }, [email, agent]);

  if (submitted) {
    return (
      <div style={{
        padding: '14px 24px',
        background: CSS_VARS.accentDim,
        border: `1px solid ${CSS_VARS.accent}`,
        borderRadius: 8,
        color: CSS_VARS.accent,
        fontFamily: CSS_VARS.fontMono,
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 440,
        margin: '0 auto',
      }}>
        ✓ You&apos;re in. We&apos;ll reach out within 48 hours.
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    padding: '14px 18px',
    background: CSS_VARS.bgCard,
    border: `1px solid ${CSS_VARS.border}`,
    borderRadius: 8,
    color: CSS_VARS.textPrimary,
    fontFamily: CSS_VARS.fontMono,
    fontSize: 14,
    outline: 'none',
    resize: 'none' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440, margin: '0 auto' }}>
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError(false); }}
        placeholder="you@company.com"
        style={{ ...inputStyle, borderColor: error ? '#888' : CSS_VARS.border }}
      />
      <textarea
        value={agent}
        onChange={e => setAgent(e.target.value)}
        rows={3}
        placeholder="What agent are you building? (optional)"
        style={inputStyle}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: 16,
          background: CSS_VARS.accent,
          color: CSS_VARS.bg,
          fontFamily: CSS_VARS.fontMono,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Request Early Access
      </button>
    </div>
  );
};

// ─── DEPLOY TOGGLE COMPONENT ─────────────────────────────
const DeployStep: FC = () => {
  const [mode, setMode] = useState<DeployMode>('cli');

  return (
    <div style={{
      background: CSS_VARS.bgCard,
      padding: '40px 32px',
      transition: 'background 0.3s',
    }}>
      <div style={{
        fontFamily: CSS_VARS.fontMono,
        fontSize: 11,
        fontWeight: 600,
        color: CSS_VARS.textMuted,
        letterSpacing: 2,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        02
        <span style={{ flex: 1, height: 1, background: CSS_VARS.border }} />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>
        Deploy on Agentific
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: CSS_VARS.textSecondary }}>
        One command — or a few clicks. We provision an isolated K8s namespace, encrypt credentials, wire up webhook tools, and start the workflow engine.
      </p>

      {/* Toggle */}
      <div style={{
        display: 'flex',
        gap: 2,
        marginTop: 16,
        marginBottom: 12,
        background: CSS_VARS.bg,
        borderRadius: 6,
        overflow: 'hidden',
        border: `1px solid ${CSS_VARS.border}`,
        width: 'fit-content',
      }}>
        {(['cli', 'ui'] as DeployMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '6px 16px',
              fontFamily: CSS_VARS.fontMono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: mode === m ? CSS_VARS.textPrimary : CSS_VARS.textMuted,
              background: mode === m ? CSS_VARS.borderAccent : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {m === 'cli' ? 'CLI' : 'Dashboard'}
          </button>
        ))}
      </div>

      {/* CLI view */}
      {mode === 'cli' && (
        <div style={{
          marginTop: 4,
          padding: '14px 16px',
          background: CSS_VARS.bg,
          borderRadius: 8,
          fontFamily: CSS_VARS.fontMono,
          fontSize: 12,
          color: CSS_VARS.textMuted,
          border: `1px solid ${CSS_VARS.border}`,
        }}>
          <span style={{ userSelect: 'none' }}>$ </span>agentific deploy --brand acme
        </div>
      )}

      {/* UI view */}
      {mode === 'ui' && (
        <div>
          <img
            src="/agentific-ui.png"
            alt="Agentific Dashboard — deploy agents visually"
            style={{
              width: '100%',
              borderRadius: 8,
              border: `1px solid ${CSS_VARS.border}`,
              marginTop: 4,
            }}
          />
          <div style={{
            marginTop: 8,
            fontFamily: CSS_VARS.fontMono,
            fontSize: 11,
            color: CSS_VARS.textMuted,
            letterSpacing: 0.3,
          }}>
            Deploy, monitor, and manage agents — no terminal needed.
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DATA ────────────────────────────────────────────────
const PILLARS: Pillar[] = [
  { num: '01', icon: '⚙️', title: 'Orchestration Engine', description: "Deterministic Python workflow engine. Your agents follow strict multi-step processes — no LLM guessing, no 50% failure rate.", highlight: 'Python workflows, not LLM orchestration' },
  { num: '02', icon: '🔒', title: 'Secure Hosting', description: "K8s namespace isolation per tenant. Each client's agent runs in its own sandbox. Data never bleeds across tenants.", highlight: 'Audit score: 9/10 multi-tenancy' },
  { num: '03', icon: '🔑', title: 'Credentials Vault', description: 'OAuth vault with KMS encryption. Connect your agents to any API — Agentific-branded or custom-branded OAuth flows.', highlight: 'KMS encryption score: 9/10' },
  { num: '04', icon: '🔄', title: 'Managed Execution', description: '24/7 uptime with auto-restart. Multi-model support. Your agents run reliably without you babysitting infrastructure.', highlight: '24/7 auto-restart, multi-model ready' },
  { num: '05', icon: '📊', title: 'Observability', description: 'Real-time cost tracking per agent, per client. Latency monitoring, audit trails, and usage analytics out of the box.', highlight: 'Cost per query, per tenant, per model' },
];

const AUDIENCE: AudienceCard[] = [
  { type: 'Agent-First Startups', title: 'Your product is an AI agent', description: "You built a legal AI, a sales copilot, a customer support agent. Now you need to deploy it securely to each of your clients — without re-inventing multi-tenant infra.", quote: "I need to serve 50 law firms from the same agent. Each firm's data must be isolated. I don't want to manage Kubernetes." },
  { type: 'SaaS Adding Agents', title: "You're embedding AI into your product", description: 'Your existing SaaS works great. Now you want to add agent capabilities without rebuilding your infrastructure from scratch.', quote: 'We need to add an AI assistant to our platform without restructuring our entire backend.' },
  { type: 'Enterprise Teams', title: 'Internal agent ecosystems', description: "You need multiple agents across departments — secure, audited, and compliant. No shadow AI. Full visibility.", quote: "Our security team won't approve anything without SOC 2 and tenant isolation documentation." },
];

const WITHOUT: ComparisonItem[] = [
  { icon: '✕', text: 'Months configuring K8s namespaces per client' },
  { icon: '✕', text: 'Credentials stored in .env files or Vault you maintain' },
  { icon: '✕', text: 'LLM orchestrating multi-step workflows — fails 50%+' },
  { icon: '✕', text: "No tenant isolation — one client can access another's data" },
  { icon: '✕', text: 'Build your own monitoring, cost tracking, audit logs' },
];

const WITH_AG: ComparisonItem[] = [
  { icon: '✓', text: 'Isolated namespace provisioned in seconds' },
  { icon: '✓', text: 'KMS-encrypted credential vault — Agentific-branded or custom' },
  { icon: '✓', text: 'Deterministic workflow engine — Python, not LLM' },
  { icon: '✓', text: 'Multi-tenant isolation scored 9/10 on audit' },
  { icon: '✓', text: 'Observability baked in — cost, latency, audit trails' },
];

const TRUST = ['Google Kubernetes Engine', 'Cloud SQL', 'KMS Encryption', 'Multi-tenant Isolation', 'SOC 2 in progress'];

// ─── MAIN LANDING PAGE ──────────────────────────────────
const AgentificLanding: FC = () => {
  const sectionZ: React.CSSProperties = { position: 'relative', zIndex: 2 };

  return (
    <>
      {/* Global styles + keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes termLine {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: ${CSS_VARS.fontDisplay};
          background: #000;
          color: ${CSS_VARS.textPrimary};
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        a { text-decoration: none; }
      `}</style>

      <DotGrid />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#08090bdd', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${CSS_VARS.border}`,
      }}>
        <a href="#" style={{ fontFamily: CSS_VARS.fontMono, fontWeight: 700, fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', color: CSS_VARS.textPrimary }}>
          agentific<span style={{ color: CSS_VARS.red }}>.</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['How it Works:#how', 'Platform:#platform', 'Use Cases:#for-who', 'Docs:https://docs.agentific.io'].map(item => {
            const [label, href] = item.split(':');
            return (
              <a key={label} href={href} style={{ fontSize: 13, color: CSS_VARS.textSecondary, fontWeight: 500, letterSpacing: 0.3 }}>
                {label}
              </a>
            );
          })}
        </div>
        <a href="#early-access" style={{
          padding: '10px 20px', background: CSS_VARS.accent, color: CSS_VARS.bg,
          fontFamily: CSS_VARS.fontMono, fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
          borderRadius: 6,
        }}>
          Get Early Access →
        </a>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 40px 80px', ...sectionZ }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', background: CSS_VARS.accentDim,
          border: `1px solid #ffffff18`, borderRadius: 100,
          fontFamily: CSS_VARS.fontMono, fontSize: 12, color: CSS_VARS.accent,
          fontWeight: 500, letterSpacing: 0.5, width: 'fit-content', marginBottom: 24,
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          <span style={{
            width: 6, height: 6, background: CSS_VARS.red, borderRadius: '50%',
            animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${CSS_VARS.redGlow}`,
            display: 'inline-block',
          }} />
          Now accepting early access applications
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.02,
          letterSpacing: -3, maxWidth: 800,
          animation: 'fadeInUp 0.6s ease-out 0.1s both',
          fontFamily: CSS_VARS.fontDisplay,
        }}>
          You build the agent.<br />We run it <em style={{ fontStyle: 'italic', color: CSS_VARS.red }}>secure.</em>
        </h1>

        <p style={{
          fontSize: 18, lineHeight: 1.6, color: CSS_VARS.textSecondary,
          maxWidth: 520, marginTop: 24, fontWeight: 400,
          animation: 'fadeInUp 0.6s ease-out 0.2s both',
        }}>
          Deploy AI agents to production with multi-tenant isolation, deterministic workflows, encrypted credentials, and managed execution. In minutes, not months.
        </p>

        <WaitlistInline id="hero" />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 24, marginTop: 20,
          fontSize: 12, color: CSS_VARS.textMuted, fontFamily: CSS_VARS.fontMono,
          animation: 'fadeInUp 0.6s ease-out 0.4s both',
        }}>
          {[
            { icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, text: 'SOC 2 in progress' },
            { icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path stroke="currentColor" strokeWidth={2} d="m9 11 3 3L22 4" /></svg>, text: 'Multi-tenant K8s isolation' },
            { icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>, text: 'KMS-encrypted credentials' },
          ].map(item => (
            <span key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.5 }}>
              {item.icon} {item.text}
            </span>
          ))}
        </div>
      </section>

      {/* TERMINAL */}
      <Terminal />

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '100px 40px', borderTop: `1px solid ${CSS_VARS.border}`, ...sectionZ }}>
        <div style={{ fontFamily: CSS_VARS.fontMono, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: CSS_VARS.accent, marginBottom: 16 }}>
          How it works
        </div>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, maxWidth: 600, fontFamily: CSS_VARS.fontDisplay }}>
          Three commands from code to production.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginTop: 64, background: CSS_VARS.border, borderRadius: 12, overflow: 'hidden' }}>
          {/* Step 01 */}
          <div style={{ background: CSS_VARS.bgCard, padding: '40px 32px' }}>
            <div style={{ fontFamily: CSS_VARS.fontMono, fontSize: 11, fontWeight: 600, color: CSS_VARS.textMuted, letterSpacing: 2, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              01 <span style={{ flex: 1, height: 1, background: CSS_VARS.border }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>Build your agent</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: CSS_VARS.textSecondary }}>
              Use any framework. Any model. LangChain, CrewAI, custom Python — we don&apos;t care. Your agent, your logic.
            </p>
            <div style={{ marginTop: 20, padding: '14px 16px', background: CSS_VARS.bg, borderRadius: 8, fontFamily: CSS_VARS.fontMono, fontSize: 12, color: CSS_VARS.textMuted, border: `1px solid ${CSS_VARS.border}` }}>
              <span style={{ color: CSS_VARS.textMuted }}># Any framework works</span><br />
              agent = YourAgent(model=&quot;gpt-4o&quot;)<br />
              agent.add_tool(webhook_tool)
            </div>
          </div>

          {/* Step 02 — Toggle */}
          <DeployStep />

          {/* Step 03 */}
          <div style={{ background: CSS_VARS.bgCard, padding: '40px 32px' }}>
            <div style={{ fontFamily: CSS_VARS.fontMono, fontSize: 11, fontWeight: 600, color: CSS_VARS.textMuted, letterSpacing: 2, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              03 <span style={{ flex: 1, height: 1, background: CSS_VARS.border }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>Serve your customers</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: CSS_VARS.textSecondary }}>
              Each client gets their own isolated instance. Their data never touches another tenant. You monitor everything from one dashboard.
            </p>
            <div style={{ marginTop: 20, padding: '14px 16px', background: CSS_VARS.bg, borderRadius: 8, fontFamily: CSS_VARS.fontMono, fontSize: 12, color: CSS_VARS.textMuted, border: `1px solid ${CSS_VARS.border}` }}>
              ✓ acme.agentific.io — live<br />
              ✓ beta.agentific.io — live<br />
              ✓ gamma.agentific.io — live
            </div>
          </div>
        </div>
      </section>

      {/* WITHOUT / WITH */}
      <section id="platform" style={{ padding: '100px 40px', borderTop: `1px solid ${CSS_VARS.border}`, ...sectionZ }}>
        <div style={{ fontFamily: CSS_VARS.fontMono, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: CSS_VARS.accent, marginBottom: 16 }}>
          The problem
        </div>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, maxWidth: 600, fontFamily: CSS_VARS.fontDisplay }}>
          Stop building infra. Start shipping agents.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 64, background: CSS_VARS.border, borderRadius: 12, overflow: 'hidden', maxWidth: 800 }}>
          <div style={{ background: CSS_VARS.bgCard, padding: '36px 32px' }}>
            <h4 style={{ fontFamily: CSS_VARS.fontMono, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24, color: CSS_VARS.textMuted }}>
              ✕ Without Agentific
            </h4>
            {WITHOUT.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, fontSize: 14, color: CSS_VARS.textSecondary, lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, marginTop: 2, fontSize: 14, color: CSS_VARS.textMuted }}>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
          <div style={{ background: CSS_VARS.bgCard, padding: '36px 32px' }}>
            <h4 style={{ fontFamily: CSS_VARS.fontMono, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24, color: CSS_VARS.accent }}>
              ✓ With Agentific
            </h4>
            {WITH_AG.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, fontSize: 14, color: CSS_VARS.textSecondary, lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, marginTop: 2, fontSize: 14, color: CSS_VARS.accent }}>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 PILLARS */}
      <section style={{ padding: '100px 40px', borderTop: `1px solid ${CSS_VARS.border}`, ...sectionZ }}>
        <div style={{ fontFamily: CSS_VARS.fontMono, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: CSS_VARS.accent, marginBottom: 16 }}>
          Platform
        </div>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, maxWidth: 600, fontFamily: CSS_VARS.fontDisplay }}>
          Everything between your agent and production.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginTop: 64, background: CSS_VARS.border, borderRadius: 12, overflow: 'hidden' }}>
          {PILLARS.map(p => (
            <div key={p.num} style={{ background: CSS_VARS.bgCard, padding: '36px 32px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 16, right: 20, fontFamily: CSS_VARS.fontMono, fontSize: 11, color: CSS_VARS.textMuted, letterSpacing: 1 }}>{p.num}</span>
              <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: CSS_VARS.accentDim, borderRadius: 10, marginBottom: 20, fontSize: 18 }}>
                {p.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: -0.3 }}>{p.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: CSS_VARS.textSecondary }}>{p.description}</p>
              <div style={{ marginTop: 16, padding: '10px 14px', background: CSS_VARS.bg, borderLeft: `2px solid ${CSS_VARS.borderAccent}`, borderRadius: '0 6px 6px 0', fontFamily: CSS_VARS.fontMono, fontSize: 11, color: CSS_VARS.textSecondary, letterSpacing: 0.3 }}>
                {p.highlight}
              </div>
            </div>
          ))}
          <div style={{ background: CSS_VARS.bgCard, padding: '36px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 28 }}>🚀</div>
            <p style={{ textAlign: 'center', fontSize: 14, color: CSS_VARS.textMuted }}>
              More coming.<br />
              <a href="#early-access" style={{ color: CSS_VARS.accent }}>Join the waitlist →</a>
            </p>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section id="for-who" style={{ padding: '100px 40px', borderTop: `1px solid ${CSS_VARS.border}`, ...sectionZ }}>
        <div style={{ fontFamily: CSS_VARS.fontMono, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: CSS_VARS.accent, marginBottom: 16 }}>
          Built for
        </div>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, maxWidth: 600, fontFamily: CSS_VARS.fontDisplay }}>
          Developers who ship agents, not infrastructure.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 64 }}>
          {AUDIENCE.map(card => (
            <div key={card.type} style={{
              background: CSS_VARS.bgCard, border: `1px solid ${CSS_VARS.border}`,
              borderRadius: 12, padding: '36px 28px', transition: 'all 0.3s',
            }}>
              <div style={{ fontFamily: CSS_VARS.fontMono, fontSize: 11, fontWeight: 600, color: CSS_VARS.textSecondary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                {card.type}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>{card.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: CSS_VARS.textSecondary }}>{card.description}</p>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${CSS_VARS.border}`, fontSize: 13, fontStyle: 'italic', color: CSS_VARS.textMuted, lineHeight: 1.5 }}>
                <span style={{ color: CSS_VARS.textMuted, fontSize: 20, fontStyle: 'normal', marginRight: 4 }}>&ldquo;</span>
                {card.quote}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40,
        padding: '32px 40px',
        borderTop: `1px solid ${CSS_VARS.border}`, borderBottom: `1px solid ${CSS_VARS.border}`,
        fontFamily: CSS_VARS.fontMono, fontSize: 12, color: CSS_VARS.textMuted,
        letterSpacing: 0.5, flexWrap: 'wrap', ...sectionZ,
      }}>
        {TRUST.map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: CSS_VARS.accent, fontSize: 14 }}>✓</span> {t}
          </div>
        ))}
      </div>

      {/* CTA */}
      <section id="early-access" style={{ padding: '120px 40px', textAlign: 'center', ...sectionZ }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: -2, marginBottom: 16, fontFamily: CSS_VARS.fontDisplay }}>
          Get early access.
        </h2>
        <p style={{ fontSize: 16, color: CSS_VARS.textSecondary, maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.6 }}>
          We&apos;re onboarding a small group of developers and teams building production AI agents. Tell us what you&apos;re working on.
        </p>
        <CtaForm />
        <p style={{ marginTop: 16, fontSize: 12, color: CSS_VARS.textMuted, fontFamily: CSS_VARS.fontMono }}>
          No spam. No BS. We&apos;ll reach out within 48 hours.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '32px 40px', borderTop: `1px solid ${CSS_VARS.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: CSS_VARS.fontMono, fontSize: 12, color: CSS_VARS.textMuted, ...sectionZ,
      }}>
        <span>© 2026 Agentific Inc. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="/privacy" style={{ color: CSS_VARS.textMuted }}>Privacy</a>
          <a href="/terms" style={{ color: CSS_VARS.textMuted }}>Terms</a>
          <a href="mailto:hello@agentific.io" style={{ color: CSS_VARS.textMuted }}>Contact</a>
        </div>
      </footer>
    </>
  );
};

export default AgentificLanding;
