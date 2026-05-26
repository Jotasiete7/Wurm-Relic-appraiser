import React, { useState } from 'react';
import type { WurmStats } from '../hooks/useStats';
import { BarChart3, RotateCcw, FileText, Image, Clipboard, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

interface StatsCardProps {
  stats: WurmStats;
  onReset: () => void;
  t: (key: any) => string;
}

export function StatsCard({ stats, onReset, t }: StatsCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const tierColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    S: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
    A: { bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa', text: '#60a5fa', glow: 'rgba(96,165,250,0.2)' },
    B: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#10b981', glow: 'rgba(16,185,129,0.2)' },
    C: { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', text: '#f97316', glow: 'rgba(249,115,22,0.2)' },
    Trash: { bg: 'rgba(107, 114, 128, 0.15)', border: '#6b7280', text: '#a3a3a3', glow: 'transparent' },
    Skiller: { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', text: '#a78bfa', glow: 'rgba(139,92,246,0.2)' },
  };

  const totalTierItems = Object.values(stats.tierCounts).reduce((a, b) => a + b, 0);

  const getPercentage = (count: number) => {
    if (totalTierItems === 0) return 0;
    return Math.round((count / totalTierItems) * 100);
  };

  const handleResetClick = () => {
    if (showConfirm) {
      onReset();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="card" style={{ marginTop: '2rem', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
      {/* Background subtle ornament */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,180,131,0.05) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          <BarChart3 size={18} /> {t('statsTitle')}
        </h3>
        
        {/* Reset button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showConfirm && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> {t('statsResetConfirm')}
            </span>
          )}
          <button 
            onClick={handleResetClick}
            onMouseLeave={() => setShowConfirm(false)}
            style={{ 
              background: showConfirm ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${showConfirm ? '#ef4444' : 'var(--border-color)'}`,
              color: showConfirm ? '#ef4444' : 'var(--text-muted)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              borderRadius: '4px',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={12} /> {showConfirm ? t('statsConfirmBtn') : t('statsResetBtn')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(212,180,131,0.1)', color: 'var(--accent-primary)', padding: '8px', borderRadius: '6px' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsItemsEvaluated')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalItems}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '6px' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsParserRuns')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalRuns}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '6px' }}>
            <Image size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsScreenshotsProcessed')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.screenshotsProcessed}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '8px', borderRadius: '6px' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsExamineLogs')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.examineLogsProcessed}</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', padding: '8px', borderRadius: '6px' }}>
            <Clipboard size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsTextLists')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.inventoryTextsProcessed}</div>
          </div>
        </div>

      </div>

      {/* Tier Distribution */}
      <div>
        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('statsQualityDistribution')}</h4>
        
        {totalTierItems === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}>
            {t('statsNoItems')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {(Object.keys(stats.tierCounts) as Array<keyof typeof stats.tierCounts>).map(tier => {
              const count = stats.tierCounts[tier];
              const pct = getPercentage(count);
              const color = tierColors[tier] || tierColors.Trash;

              return (
                <div key={tier} style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {/* Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge tier-${tier.toLowerCase()}`} style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px',
                        boxShadow: `0 0 8px ${color.glow}`
                      }}>
                        {tier === 'Skiller' ? '⚡ Skiller' : `Tier ${tier}`}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {count} {count === 1 ? t('statsItemSingular') : t('statsItemPlural')}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: color.text }}>{pct}%</span>
                  </div>

                  {/* Progress Bar Container */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    {/* Progress Fill */}
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: color.border,
                      borderRadius: '3px',
                      transition: 'width 0.4s ease-out'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
