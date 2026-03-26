import { useState, useEffect, useRef, useCallback } from 'react';

// ─── DESIGN TOKENS ──────────────────────────────────────
const V = {
  bg: '#08090b',
  bgE: '#0f1114',
  bgC: '#13151a',
  bgCH: '#1a1d24',
  brd: '#1e2028',
  brdA: '#2a2d38',
  tp: '#e8e9ed',
  ts: '#8b8d98',
  tm: '#5c5e6a',
  acc: '#ffffff',
  accD: '#ffffff10',
  accG: '#ffffff20',
  red: '#e63946',
  redD: '#e6394615',
  redG: '#e6394630',
  fd: "'Outfit', sans-serif",
  fm: "'JetBrains Mono', monospace",
};

// ─── DOT GRID CANVAS ────────────────────────────────────
const DotGrid = () => {
  const glowRef = useRef(null);
  const maskRef = useRef(null);

  useEffect(() => {
    const glowC = glowRef.current;
    const maskC = maskRef.current;
    if (!glowC || !maskC) return;
    const gCtx = glowC.getContext('2d');
    const mCtx = maskC.getContext('2d');
    const DOT_R = 1.5, SPACING = 22, FADE_DELAY = 120;
    let W = window.innerWidth;
    let H = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    let mx = W / 2, my = H / 2, tx = W / 2, ty = H / 2;
    let brightness = 0, scale = 0, lastMove = 0, animId;

    const drawMask = () => {
      mCtx.clearRect(0, 0, W, H);
      mCtx.fillStyle = V.bg;
      mCtx.fillRect(0, 0, W, H);
      mCtx.globalCompositeOperation = 'destination-out';
      for (let x = SPACING / 2; x < W; x += SPACING)
        for (let y = SPACING / 2; y < H; y += SPACING) {
          mCtx.beginPath();
          mCtx.arc(x, y, DOT_R, 0, Math.PI * 2);
          mCtx.fillStyle = 'rgba(0,0,0,1)';
          mCtx.fill();
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

    const lerp = (a, b, t) => a + (b - a) * t;

    const drawGlow = (x, y, b, sc) => {
      gCtx.clearRect(0, 0, W, H);
      if (b <= 0.01) return;
      const maxR = 150 * sc, midR = maxR * 0.35, coreR = maxR * 0.08;
      let g = gCtx.createRadialGradient(x, y, midR * 0.5, x, y, maxR);
      g.addColorStop(0, `rgba(200,210,240,${b * 0.15})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = g; gCtx.fillRect(0, 0, W, H);
      g = gCtx.createRadialGradient(x, y, coreR, x, y, midR);
      g.addColorStop(0, `rgba(255,255,255,${b * 0.5})`);
      g.addColorStop(0.5, `rgba(210,220,245,${b * 0.2})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = g; gCtx.fillRect(0, 0, W, H);
      g = gCtx.createRadialGradient(x, y, 0, x, y, coreR);
      g.addColorStop(0, `rgba(255,255,255,${b * 0.8})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      gCtx.fillStyle = g; gCtx.fillRect(0, 0, W, H);
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      tx = lerp(tx, mx, 0.1); ty = lerp(ty, my, 0.1);
      const moving = performance.now() - lastMove < FADE_DELAY;
      brightness = lerp(brightness, moving ? 1 : 0, moving ? 0.06 : 0.04);
      scale = lerp(scale, moving ? 1 : 0, moving ? 0.05 : 0.04);
      drawGlow(tx, ty, brightness, scale);
    };

    const onMove = (e) => { mx = e.clientX; my = e.clientY + window.scrollY; lastMove = performance.now(); };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); };
  }, []);

  const cs = { position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none' };
  return (<>
    <canvas ref={glowRef} style={{ ...cs, zIndex: 0 }} />
    <canvas ref={maskRef} style={{ ...cs, zIndex: 1 }} />
  </>);
};

// ─── TERMINAL ────────────────────────────────────────────
const Terminal = () => {
  const lines = [
    { c: <span style={{ color: V.tm }}># Your agent code. Your model. Your tools.</span>, d: 0.8 },
    { c: <><span style={{ color: V.tm, userSelect: 'none' }}>$ </span><span style={{ color: V.ts }}>agentific deploy</span> <span style={{ color: '#a0a3ad' }}>--agent</span> <span style={{ color: V.acc }}>./my-agent</span> <span style={{ color: '#a0a3ad' }}>--brand</span> <span style={{ color: V.acc }}>acme-corp</span></>, d: 1.2 },
    { c: <br />, d: 1.6 },
    { c: <span style={{ color: V.tm, fontStyle: 'italic' }}>⠋ Provisioning isolated namespace...</span>, d: 2.4 },
    { c: <span style={{ color: V.tm, fontStyle: 'italic' }}>⠋ Encrypting credentials via KMS...</span>, d: 2.8 },
    { c: <span style={{ color: V.tm, fontStyle: 'italic' }}>⠋ Registering webhook tools...</span>, d: 3.2 },
    { c: <span style={{ color: V.tm, fontStyle: 'italic' }}>⠋ Starting workflow engine...</span>, d: 3.8 },
    { c: <br />, d: 4.4 },
    { c: <span style={{ color: V.red }}>✓ Agent live at https://acme-corp.agentific.io</span>, d: 5.0 },
  ];
  return (
    <section style={{ padding: '0 40px 100px', position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', background: V.bgE, border: `1px solid ${V.brd}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', background: V.bgC, borderBottom: `1px solid ${V.brd}` }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: V.brdA }} />)}
          <div style={{ flex: 1, textAlign: 'center', fontFamily: V.fm, fontSize: 12, color: V.tm }}>deploy-agent.sh</div>
        </div>
        <div style={{ padding: 24, fontFamily: V.fm, fontSize: 13, lineHeight: 1.8 }}>
          {lines.map((l, i) => <div key={i} style={{ opacity: 0, animation: `termLine 0.3s ease-out ${l.d}s forwards` }}>{l.c}</div>)}
        </div>
      </div>
    </section>
  );
};

// ─── WAITLIST FORM ───────────────────────────────────────
const WaitlistInline = ({ id }) => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);
  const submit = useCallback(() => {
    if (!email || !email.includes('@')) { setErr(true); return; }
    setDone(true);
    console.log(`Waitlist (${id}):`, email);
  }, [email, id]);

  if (done) return (
    <div style={{ padding: '14px 24px', background: V.accD, border: `1px solid ${V.acc}`, borderRadius: 8, color: V.acc, fontFamily: V.fm, fontSize: 14, textAlign: 'center', maxWidth: 520, marginTop: 40 }}>
      ✓ You're on the list. We'll be in touch.
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 40, maxWidth: 520 }}>
      <input type="email" value={email}
        onChange={e => { setEmail(e.target.value); setErr(false); }}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="you@company.com"
        style={{ flex: 1, padding: '14px 18px', background: V.bgC, border: `1px solid ${err ? '#888' : V.brd}`, borderRight: 'none', borderRadius: '8px 0 0 8px', color: V.tp, fontFamily: V.fm, fontSize: 14, outline: 'none' }}
      />
      <button onClick={submit} style={{ padding: '14px 28px', background: V.acc, color: V.bg, fontFamily: V.fm, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', border: `1px solid ${V.acc}`, borderRadius: '0 8px 8px 0', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        Join Waitlist
      </button>
    </div>
  );
};

// ─── CTA FORM ────────────────────────────────────────────
const CtaForm = () => {
  const [email, setEmail] = useState('');
  const [agent, setAgent] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);
  const submit = useCallback(() => {
    if (!email || !email.includes('@')) { setErr(true); return; }
    setDone(true);
    console.log('Early access:', email, agent);
  }, [email, agent]);

  if (done) return (
    <div style={{ padding: '14px 24px', background: V.accD, border: `1px solid ${V.acc}`, borderRadius: 8, color: V.acc, fontFamily: V.fm, fontSize: 14, textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
      ✓ You're in. We'll reach out within 48 hours.
    </div>
  );

  const is = { padding: '14px 18px', background: V.bgC, border: `1px solid ${V.brd}`, borderRadius: 8, color: V.tp, fontFamily: V.fm, fontSize: 14, outline: 'none', resize: 'none' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440, margin: '0 auto' }}>
      <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(false); }} placeholder="you@company.com" style={{ ...is, borderColor: err ? '#888' : V.brd }} />
      <textarea value={agent} onChange={e => setAgent(e.target.value)} rows={3} placeholder="What agent are you building? (optional)" style={is} />
      <button onClick={submit} style={{ padding: 16, background: V.acc, color: V.bg, fontFamily: V.fm, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        Request Early Access
      </button>
    </div>
  );
};

// ─── DEPLOY TOGGLE ───────────────────────────────────────
const DeployStep = () => {
  const [mode, setMode] = useState('cli');
  const stepNum = { fontFamily: V.fm, fontSize: 11, fontWeight: 600, color: V.tm, letterSpacing: 2, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 };
  return (
    <div style={{ background: V.bgC, padding: '40px 32px' }}>
      <div style={stepNum}>02 <span style={{ flex: 1, height: 1, background: V.brd }} /></div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>Deploy on Agentific</h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: V.ts }}>One command — or a few clicks. We provision an isolated K8s namespace, encrypt credentials, wire up webhook tools, and start the workflow engine.</p>
      <div style={{ display: 'flex', gap: 2, marginTop: 16, marginBottom: 12, background: V.bg, borderRadius: 6, overflow: 'hidden', border: `1px solid ${V.brd}`, width: 'fit-content' }}>
        {['cli', 'ui'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '6px 16px', fontFamily: V.fm, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: mode === m ? V.tp : V.tm, background: mode === m ? V.brdA : 'transparent', border: 'none', cursor: 'pointer' }}>
            {m === 'cli' ? 'CLI' : 'Dashboard'}
          </button>
        ))}
      </div>
      {mode === 'cli' && (
        <div style={{ marginTop: 4, padding: '14px 16px', background: V.bg, borderRadius: 8, fontFamily: V.fm, fontSize: 12, color: V.tm, border: `1px solid ${V.brd}` }}>
          <span style={{ userSelect: 'none' }}>$ </span>agentific deploy --brand acme
        </div>
      )}
      {mode === 'ui' && (
        <div>
          <img src="/agentific-ui.png" alt="Agentific Dashboard" style={{ width: '100%', borderRadius: 8, border: `1px solid ${V.brd}`, marginTop: 4 }} />
          <div style={{ marginTop: 8, fontFamily: V.fm, fontSize: 11, color: V.tm, letterSpacing: 0.3 }}>Deploy, monitor, and manage agents — no terminal needed.</div>
        </div>
      )}
    </div>
  );
};

// ─── DATA ────────────────────────────────────────────────
const PILLARS = [
  { n: '01', i: '⚙️', t: 'Orchestration Engine', d: 'Deterministic Python workflow engine. Your agents follow strict multi-step processes — no LLM guessing, no 50% failure rate.', h: 'Python workflows, not LLM orchestration' },
  { n: '02', i: '🔒', t: 'Secure Hosting', d: "K8s namespace isolation per tenant. Each client's agent runs in its own sandbox. Data never bleeds across tenants.", h: 'Audit score: 9/10 multi-tenancy' },
  { n: '03', i: '🔑', t: 'Credentials Vault', d: 'OAuth vault with KMS encryption. Connect your agents to any API — Agentific-branded or custom-branded OAuth flows.', h: 'KMS encryption score: 9/10' },
  { n: '04', i: '🔄', t: 'Managed Execution', d: '24/7 uptime with auto-restart. Multi-model support. Your agents run reliably without you babysitting infrastructure.', h: '24/7 auto-restart, multi-model ready' },
  { n: '05', i: '📊', t: 'Observability', d: 'Real-time cost tracking per agent, per client. Latency monitoring, audit trails, and usage analytics out of the box.', h: 'Cost per query, per tenant, per model' },
];

const AUDIENCE = [
  { type: 'Agent-First Startups', title: 'Your product is an AI agent', desc: "You built a legal AI, a sales copilot, a customer support agent. Now you need to deploy it securely to each of your clients — without re-inventing multi-tenant infra.", quote: "I need to serve 50 law firms from the same agent. Each firm's data must be isolated. I don't want to manage Kubernetes." },
  { type: 'SaaS Adding Agents', title: "You're embedding AI into your product", desc: 'Your existing SaaS works great. Now you want to add agent capabilities without rebuilding your infrastructure from scratch.', quote: 'We need to add an AI assistant to our platform without restructuring our entire backend.' },
  { type: 'Enterprise Teams', title: 'Internal agent ecosystems', desc: 'You need multiple agents across departments — secure, audited, and compliant. No shadow AI. Full visibility.', quote: "Our security team won't approve anything without SOC 2 and tenant isolation documentation." },
];

const WITHOUT = [
  'Months configuring K8s namespaces per client',
  'Credentials stored in .env files or Vault you maintain',
  'LLM orchestrating multi-step workflows — fails 50%+',
  "No tenant isolation — one client can access another's data",
  'Build your own monitoring, cost tracking, audit logs',
];

const WITH_AG = [
  'Isolated namespace provisioned in seconds',
  'KMS-encrypted credential vault — Agentific-branded or custom',
  'Deterministic workflow engine — Python, not LLM',
  'Multi-tenant isolation scored 9/10 on audit',
  'Observability baked in — cost, latency, audit trails',
];

const TRUST = ['Google Kubernetes Engine', 'Cloud SQL', 'KMS Encryption', 'Multi-tenant Isolation', 'SOC 2 in progress'];

// ─── SECTION HELPERS ─────────────────────────────────────
const zz = { position: 'relative', zIndex: 2 };
const SectionLabel = ({ children }) => (
  <div style={{ fontFamily: V.fm, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: V.acc, marginBottom: 16 }}>{children}</div>
);
const SectionTitle = ({ children }) => (
  <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.1, maxWidth: 600, fontFamily: V.fd }}>{children}</h2>
);
const StepNum = ({ children }) => (
  <div style={{ fontFamily: V.fm, fontSize: 11, fontWeight: 600, color: V.tm, letterSpacing: 2, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
    {children} <span style={{ flex: 1, height: 1, background: V.brd }} />
  </div>
);
const CodeBlock = ({ children }) => (
  <div style={{ marginTop: 20, padding: '14px 16px', background: V.bg, borderRadius: 8, fontFamily: V.fm, fontSize: 12, color: V.tm, border: `1px solid ${V.brd}` }}>{children}</div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────
const AgentificLanding = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes termLine { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { font-family:${V.fd}; background:#000; color:${V.tp}; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
        a { text-decoration:none; }
      `}</style>

      <DotGrid />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#08090bdd', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${V.brd}` }}>
        <a href="#" style={{ fontFamily: V.fm, fontWeight: 700, fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', color: V.tp }}>
          agentific<span style={{ color: V.red }}>.</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['How it Works','#how'],['Platform','#platform'],['Use Cases','#for-who'],['Docs','https://docs.agentific.io']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 13, color: V.ts, fontWeight: 500, letterSpacing: 0.3 }}>{l}</a>
          ))}
        </div>
        <a href="#early-access" style={{ padding: '10px 20px', background: V.acc, color: V.bg, fontFamily: V.fm, fontSize: 13, fontWeight: 600, letterSpacing: 0.5, borderRadius: 6 }}>
          Get Early Access →
        </a>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 40px 80px', ...zz }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: V.accD, border: '1px solid #ffffff18', borderRadius: 100, fontFamily: V.fm, fontSize: 12, color: V.acc, fontWeight: 500, letterSpacing: 0.5, width: 'fit-content', marginBottom: 24, animation: 'fadeInUp 0.6s ease-out' }}>
          <span style={{ width: 6, height: 6, background: V.red, borderRadius: '50%', animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${V.redG}`, display: 'inline-block' }} />
          Now accepting early access applications
        </div>

        <h1 style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 800, animation: 'fadeInUp 0.6s ease-out 0.1s both', fontFamily: V.fd }}>
          You build the agent.<br />We run it <em style={{ fontStyle: 'italic', color: V.red }}>secure.</em>
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.6, color: V.ts, maxWidth: 520, marginTop: 24, fontWeight: 400, animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          Deploy AI agents to production with multi-tenant isolation, deterministic workflows, encrypted credentials, and managed execution. In minutes, not months.
        </p>

        <WaitlistInline id="hero" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 20, fontSize: 12, color: V.tm, fontFamily: V.fm, animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
          {[
            { svg: <svg width={14} height={14} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, t: 'SOC 2 in progress' },
            { svg: <svg width={14} height={14} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path stroke="currentColor" strokeWidth={2} d="m9 11 3 3L22 4"/></svg>, t: 'Multi-tenant K8s isolation' },
            { svg: <svg width={14} height={14} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth={2} d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>, t: 'KMS-encrypted credentials' },
          ].map(x => <span key={x.t} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.5 }}>{x.svg} {x.t}</span>)}
        </div>
      </section>

      <Terminal />

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '100px 40px', borderTop: `1px solid ${V.brd}`, ...zz }}>
        <SectionLabel>How it works</SectionLabel>
        <SectionTitle>Three commands from code to production.</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginTop: 64, background: V.brd, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ background: V.bgC, padding: '40px 32px' }}>
            <StepNum>01</StepNum>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>Build your agent</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: V.ts }}>Use any framework. Any model. LangChain, CrewAI, custom Python — we don't care. Your agent, your logic.</p>
            <CodeBlock><span style={{ color: V.tm }}># Any framework works</span><br/>agent = YourAgent(model="gpt-4o")<br/>agent.add_tool(webhook_tool)</CodeBlock>
          </div>
          <DeployStep />
          <div style={{ background: V.bgC, padding: '40px 32px' }}>
            <StepNum>03</StepNum>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>Serve your customers</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: V.ts }}>Each client gets their own isolated instance. Their data never touches another tenant. You monitor everything from one dashboard.</p>
            <CodeBlock>✓ acme.agentific.io — live<br/>✓ beta.agentific.io — live<br/>✓ gamma.agentific.io — live</CodeBlock>
          </div>
        </div>
      </section>

      {/* WITHOUT / WITH */}
      <section id="platform" style={{ padding: '100px 40px', borderTop: `1px solid ${V.brd}`, ...zz }}>
        <SectionLabel>The problem</SectionLabel>
        <SectionTitle>Stop building infra. Start shipping agents.</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginTop: 64, background: V.brd, borderRadius: 12, overflow: 'hidden', maxWidth: 800 }}>
          <div style={{ background: V.bgC, padding: '36px 32px' }}>
            <h4 style={{ fontFamily: V.fm, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24, color: V.tm }}>✕ Without Agentific</h4>
            {WITHOUT.map((t, i) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, fontSize: 14, color: V.ts, lineHeight: 1.5 }}><span style={{ flexShrink: 0, marginTop: 2, fontSize: 14, color: V.tm }}>✕</span> {t}</div>)}
          </div>
          <div style={{ background: V.bgC, padding: '36px 32px' }}>
            <h4 style={{ fontFamily: V.fm, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24, color: V.acc }}>✓ With Agentific</h4>
            {WITH_AG.map((t, i) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, fontSize: 14, color: V.ts, lineHeight: 1.5 }}><span style={{ flexShrink: 0, marginTop: 2, fontSize: 14, color: V.acc }}>✓</span> {t}</div>)}
          </div>
        </div>
      </section>

      {/* 5 PILLARS */}
      <section style={{ padding: '100px 40px', borderTop: `1px solid ${V.brd}`, ...zz }}>
        <SectionLabel>Platform</SectionLabel>
        <SectionTitle>Everything between your agent and production.</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginTop: 64, background: V.brd, borderRadius: 12, overflow: 'hidden' }}>
          {PILLARS.map(p => (
            <div key={p.n} style={{ background: V.bgC, padding: '36px 32px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 16, right: 20, fontFamily: V.fm, fontSize: 11, color: V.tm, letterSpacing: 1 }}>{p.n}</span>
              <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: V.accD, borderRadius: 10, marginBottom: 20, fontSize: 18 }}>{p.i}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: -0.3 }}>{p.t}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: V.ts }}>{p.d}</p>
              <div style={{ marginTop: 16, padding: '10px 14px', background: V.bg, borderLeft: `2px solid ${V.brdA}`, borderRadius: '0 6px 6px 0', fontFamily: V.fm, fontSize: 11, color: V.ts, letterSpacing: 0.3 }}>{p.h}</div>
            </div>
          ))}
          <div style={{ background: V.bgC, padding: '36px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 28 }}>🚀</div>
            <p style={{ textAlign: 'center', fontSize: 14, color: V.tm }}>More coming.<br /><a href="#early-access" style={{ color: V.acc }}>Join the waitlist →</a></p>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section id="for-who" style={{ padding: '100px 40px', borderTop: `1px solid ${V.brd}`, ...zz }}>
        <SectionLabel>Built for</SectionLabel>
        <SectionTitle>Developers who ship agents, not infrastructure.</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 64 }}>
          {AUDIENCE.map(c => (
            <div key={c.type} style={{ background: V.bgC, border: `1px solid ${V.brd}`, borderRadius: 12, padding: '36px 28px' }}>
              <div style={{ fontFamily: V.fm, fontSize: 11, fontWeight: 600, color: V.ts, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{c.type}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>{c.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: V.ts }}>{c.desc}</p>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${V.brd}`, fontSize: 13, fontStyle: 'italic', color: V.tm, lineHeight: 1.5 }}>
                <span style={{ color: V.tm, fontSize: 20, fontStyle: 'normal', marginRight: 4 }}>"</span>{c.quote}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '32px 40px', borderTop: `1px solid ${V.brd}`, borderBottom: `1px solid ${V.brd}`, fontFamily: V.fm, fontSize: 12, color: V.tm, letterSpacing: 0.5, flexWrap: 'wrap', ...zz }}>
        {TRUST.map(t => <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: V.acc, fontSize: 14 }}>✓</span> {t}</div>)}
      </div>

      {/* CTA */}
      <section id="early-access" style={{ padding: '120px 40px', textAlign: 'center', ...zz }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: -2, marginBottom: 16, fontFamily: V.fd }}>Get early access.</h2>
        <p style={{ fontSize: 16, color: V.ts, maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.6 }}>We're onboarding a small group of developers and teams building production AI agents. Tell us what you're working on.</p>
        <CtaForm />
        <p style={{ marginTop: 16, fontSize: 12, color: V.tm, fontFamily: V.fm }}>No spam. No BS. We'll reach out within 48 hours.</p>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 40px', borderTop: `1px solid ${V.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: V.fm, fontSize: 12, color: V.tm, ...zz }}>
        <span>© 2026 Agentific Inc. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="/privacy" style={{ color: V.tm }}>Privacy</a>
          <a href="/terms" style={{ color: V.tm }}>Terms</a>
          <a href="mailto:hello@agentific.io" style={{ color: V.tm }}>Contact</a>
        </div>
      </footer>
    </>
  );
};

export default AgentificLanding;
