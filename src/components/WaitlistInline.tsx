'use client';

import { useState, useCallback, type FC } from 'react';
import { CSS_VARS } from '@/lib/styles';

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
          textTransform: 'uppercase',
          border: `1px solid ${CSS_VARS.accent}`,
          borderRadius: '0 8px 8px 0',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Join Waitlist
      </button>
    </div>
  );
};

export default WaitlistInline;
