'use client';

import { useState, type FC } from 'react';
import { CSS_VARS } from '@/lib/styles';

type DeployMode = 'cli' | 'ui';

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

export default DeployStep;
