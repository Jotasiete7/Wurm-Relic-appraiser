import { useState } from 'react';

interface QuickGuideProps {
  t: (key: any) => string;
}

const tips = [
  { titleKey: 'guideTip1Title', bodyKey: 'guideTip1Body' },
  { titleKey: 'guideTip2Title', bodyKey: 'guideTip2Body' },
  { titleKey: 'guideTip3Title', bodyKey: 'guideTip3Body' },
  { titleKey: 'guideTip4Title', bodyKey: 'guideTip4Body' },
];

export function QuickGuide({ t }: QuickGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: '1.5rem' }}>

      {/* Toggle trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          justifyContent: 'center',
          gap: '10px',
          padding: '0.65rem 1.25rem',
          background: open ? 'rgba(212,180,131,0.08)' : 'var(--bg-panel)',
          border: `1px solid ${open ? 'rgba(212,180,131,0.35)' : 'var(--border-color)'}`,
          color: open ? 'var(--accent-primary)' : 'var(--text-secondary)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {t('guideOpen')}
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem',
          opacity: 0.6,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
          transition: 'transform 0.2s',
        }}>▼</span>
      </button>

      {/* Expandable content */}
      {open && (
        <div style={{
          marginTop: '0.75rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Intro */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{
              margin: '0 0 0.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              {t('guideTitle')}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>
              {t('guideIntro')}
            </p>
          </div>

          {/* Steps grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.875rem',
            marginBottom: '1.25rem',
          }}>
            {tips.map(({ titleKey, bodyKey }, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                borderLeft: '3px solid var(--accent-primary)',
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.02em',
                }}>
                  {t(titleKey as any)}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                }}>
                  {t(bodyKey as any)}
                </p>
              </div>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {t('guideClose')}
          </button>
        </div>
      )}
    </div>
  );
}
