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
  const [openGuide, setOpenGuide] = useState(false);
  const [openScoring, setOpenScoring] = useState(false);

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Side-by-side Toggle Triggers */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setOpenGuide(o => !o); setOpenScoring(false); }}
          style={{
            flex: 1,
            justifyContent: 'center',
            gap: '8px',
            padding: '0.65rem 1.25rem',
            background: openGuide ? 'rgba(212,180,131,0.08)' : 'var(--bg-panel)',
            border: `1px solid ${openGuide ? 'rgba(212,180,131,0.35)' : 'var(--border-color)'}`,
            color: openGuide ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderRadius: '8px',
            fontSize: '0.85rem',
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
            transform: openGuide ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
            transition: 'transform 0.2s',
          }}>▼</span>
        </button>

        <button
          onClick={() => { setOpenScoring(o => !o); setOpenGuide(false); }}
          style={{
            flex: 1,
            justifyContent: 'center',
            gap: '8px',
            padding: '0.65rem 1.25rem',
            background: openScoring ? 'rgba(212,180,131,0.08)' : 'var(--bg-panel)',
            border: `1px solid ${openScoring ? 'rgba(212,180,131,0.35)' : 'var(--border-color)'}`,
            color: openScoring ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {t('scoringOpen')}
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.7rem',
            opacity: 0.6,
            transform: openScoring ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
            transition: 'transform 0.2s',
          }}>▼</span>
        </button>
      </div>

      {/* Expandable Guide Panel */}
      {openGuide && (
        <div style={{
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
            onClick={() => setOpenGuide(false)}
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

      {/* Expandable Scoring System Panel */}
      {openScoring && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {t('scoringSystemTitle')}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            {/* Column 1: Metals & Rarity */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                {t('scoringColMetals')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Adamantine / Glimmersteel / Seryll</span>
                  <strong style={{ color: '#10b981' }}>+15 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Steel / Electrum / Brass / Bronze / Iron</span>
                  <strong style={{ color: '#10b981' }}>+5 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Raridade: Fantastic</span>
                  <strong style={{ color: '#10b981' }}>+20 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Raridade: Supreme</span>
                  <strong style={{ color: '#10b981' }}>+12 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Raridade: Rare</span>
                  <strong style={{ color: '#10b981' }}>+6 pts</strong>
                </div>
              </div>
            </div>

            {/* Column 2: Runes */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                {t('scoringColRunes')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Usage Speed (Velocidade)</span>
                  <strong style={{ color: '#10b981' }}>+20 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gather Quality (Coleta)</span>
                  <strong style={{ color: '#10b981' }}>+15 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Improve Chance / QL Imped</span>
                  <strong style={{ color: '#10b981' }}>+12 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Raking Harvesting (Coleta Rápida)</span>
                  <strong style={{ color: '#10b981' }}>+20 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Less Decay (Containers)</span>
                  <strong style={{ color: '#10b981' }}>+15 pts</strong>
                </div>
              </div>
            </div>

            {/* Column 3: Enchants & Skiller */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                {t('scoringColEnchants')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>WoA, CoC, Bless, LT (QL 100)</span>
                  <strong style={{ color: '#10b981' }}>+20 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Encanto QL 95 - 99</span>
                  <strong style={{ color: '#10b981' }}>+15 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Encanto QL 90 - 94</span>
                  <strong style={{ color: '#10b981' }}>+10 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Skiller (QL &lt;= 10 &amp; CoC &gt;= 70)</span>
                  <strong style={{ color: 'var(--accent-primary)' }}>Especial</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px', lineHeight: 1.3 }}>
                  {t('scoringSkillerDesc')}
                </div>
              </div>
            </div>

          </div>

          <button
            onClick={() => setOpenScoring(false)}
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
