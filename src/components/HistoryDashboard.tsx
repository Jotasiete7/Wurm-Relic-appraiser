import { useState } from 'react';
import type { SavedAppraisal } from '../hooks/useHistory';
import { Calendar, Trash2, Eye, FileText, Image, Layers, Sparkles, AlertTriangle } from 'lucide-react';

interface HistoryDashboardProps {
  history: SavedAppraisal[];
  onLoadAppraisal: (appraisal: SavedAppraisal) => void;
  onDeleteAppraisal: (id: string) => void;
  onClearHistory: () => void;
  t: (key: any) => string;
}

export function HistoryDashboard({
  history,
  onLoadAppraisal,
  onDeleteAppraisal,
  onClearHistory,
  t
}: HistoryDashboardProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierStats = (items: any[]) => {
    const counts = { S: 0, A: 0, B: 0, C: 0, Trash: 0, Skiller: 0 };
    for (const item of items) {
      const tier = item.tier as keyof typeof counts;
      if (tier in counts) {
        counts[tier]++;
      }
    }
    return counts;
  };

  if (history.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--text-muted)' }}>
        <Sparkles size={32} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', opacity: 0.7 }} />
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>{t('noHistoryTitle')}</h3>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>{t('noHistorySubtitle')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
          {t('historyTab')}
          <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '2px 10px', borderRadius: '999px', fontWeight: 400 }}>
            {history.length} {history.length === 1 ? t('statsItemSingular') : t('statsItemPlural')}
          </span>
        </h2>

        {/* Clear all button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showClearConfirm && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> {t('historyClearConfirm')}
            </span>
          )}
          <button
            onClick={() => {
              if (showClearConfirm) {
                onClearHistory();
                setShowClearConfirm(false);
              } else {
                setShowClearConfirm(true);
              }
            }}
            onMouseLeave={() => setShowClearConfirm(false)}
            style={{
              background: showClearConfirm ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              border: `1px solid ${showClearConfirm ? '#ef4444' : 'var(--border-color)'}`,
              color: showClearConfirm ? '#ef4444' : 'var(--text-muted)',
              padding: '6px 12px',
              fontSize: '0.78rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: 600
            }}
          >
            <Trash2 size={13} />
            {showClearConfirm ? t('confirmBtn') : t('clearHistoryBtn')}
          </button>
        </div>
      </div>

      {/* History Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        {history.map(run => {
          const stats = getTierStats(run.items);
          const hasS = stats.S > 0;
          const hasA = stats.A > 0;
          
          return (
            <div
              key={run.id}
              className="card"
              style={{
                background: 'var(--bg-panel)',
                border: `1px solid ${hasS ? 'rgba(245, 158, 11, 0.25)' : hasA ? 'rgba(96, 165, 250, 0.25)' : 'var(--border-color)'}`,
                boxShadow: hasS ? '0 4px 20px rgba(245, 158, 11, 0.03)' : 'none',
                padding: '1.25rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              {/* Left Column: Meta & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {run.name}
                  </h4>
                  {run.hasScreenshot && run.hasExamine ? (
                    <span title="Merged Input" style={{ display: 'inline-flex', color: '#10b981' }}><Layers size={13} /></span>
                  ) : run.hasScreenshot ? (
                    <span title="Screenshot Only" style={{ display: 'inline-flex', color: 'var(--accent-primary)' }}><Image size={13} /></span>
                  ) : (
                    <span title="Examine Log Only" style={{ display: 'inline-flex', color: 'var(--accent-primary)' }}><FileText size={13} /></span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  <span>{formatDate(run.timestamp)}</span>
                  <span>•</span>
                  <span>{run.items.length} {run.items.length === 1 ? t('statsItemSingular') : t('statsItemPlural')}</span>
                </div>
              </div>

              {/* Middle Column: Tier Badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {stats.S > 0 && <span className="badge tier-s" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>S: {stats.S}</span>}
                {stats.A > 0 && <span className="badge tier-a" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>A: {stats.A}</span>}
                {stats.B > 0 && <span className="badge tier-b" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>B: {stats.B}</span>}
                {stats.C > 0 && <span className="badge tier-c" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>C: {stats.C}</span>}
                {stats.Skiller > 0 && <span className="badge tier-skiller" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>SKL: {stats.Skiller}</span>}
                {stats.Trash > 0 && <span className="badge tier-trash" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Trash: {stats.Trash}</span>}
              </div>

              {/* Right Column: Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                <button
                  onClick={() => onLoadAppraisal(run)}
                  style={{
                    background: 'var(--accent-primary)',
                    border: 'none',
                    color: '#000',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Eye size={13} />
                  {t('loadAppraisalBtn')}
                </button>

                <button
                  onClick={() => onDeleteAppraisal(run.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  <Trash2 size={13} />
                  {t('deleteAppraisalBtn')}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
