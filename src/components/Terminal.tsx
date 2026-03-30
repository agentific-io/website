'use client';

import type { FC, ReactNode } from 'react';
import { CSS_VARS } from '@/lib/styles';

interface TerminalLine {
  content: ReactNode;
  delay: number;
}

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

export default Terminal;
