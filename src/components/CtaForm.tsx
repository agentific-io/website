'use client';

import { useState, useCallback, type FC } from 'react';
import { CSS_VARS } from '@/lib/styles';

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
    resize: 'none',
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
          textTransform: 'uppercase',
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

export default CtaForm;
