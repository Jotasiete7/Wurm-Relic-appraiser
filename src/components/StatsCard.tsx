import { useState, useEffect } from 'react';
import type { WurmStats } from '../hooks/useStats';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { BarChart3, RotateCcw, FileText, Image, TrendingUp, Zap, AlertTriangle, Globe, Sparkles, Loader } from 'lucide-react';

interface StatsCardProps {
  stats: WurmStats;
  onReset: () => void;
  t: (key: any) => string;
}

interface GlobalStats {
  summary: {
    totalRuns: number;
    totalItems: number;
    totalRunes: number;
    totalEnchants: number;
  };
  tiers: {
    S: { count: number; pct: number };
    A: { count: number; pct: number };
    B: { count: number; pct: number };
    C: { count: number; pct: number };
    Trash: { count: number; pct: number };
    Skiller: { count: number; pct: number };
  };
  runes: { god: string; count: number; pct: number }[];
}

const MOCK_GLOBAL_STATS: GlobalStats = {
  summary: {
    totalRuns: 148,
    totalItems: 5934,
    totalRunes: 3422,
    totalEnchants: 2511,
  },
  tiers: {
    S: { count: 118, pct: 2.0 },
    A: { count: 296, pct: 5.0 },
    B: { count: 1483, pct: 25.0 },
    C: { count: 2077, pct: 35.0 },
    Trash: { count: 1958, pct: 33.0 },
    Skiller: { count: 2, pct: 0.0 }
  },
  runes: [
    { god: 'fo', count: 1368, pct: 40.0 },
    { god: 'vynora', count: 1026, pct: 30.0 },
    { god: 'magranon', count: 684, pct: 20.0 },
    { god: 'libila', count: 274, pct: 8.0 },
    { god: 'jackal', count: 70, pct: 2.0 }
  ]
};

export function StatsCard({ stats, onReset, t }: StatsCardProps) {
  const [viewMode, setViewMode] = useState<'session' | 'global'>('session');
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Global stats state
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode !== 'global') return;

    if (!isSupabaseConfigured || !supabase) {
      // Smart simulation mode local fallback
      setGlobalStats(MOCK_GLOBAL_STATS);
      return;
    }

    const fetchGlobal = async () => {
      setLoadingGlobal(true);
      setGlobalError(null);
      try {
        // Fetch 1: Summary Metrics
        const { data: summaryData, error: summaryErr } = await supabase!.rpc('get_global_summary_stats');
        if (summaryErr) throw summaryErr;

        // Fetch 2: Tier Metrics
        const { data: tierData, error: tierErr } = await supabase!.rpc('get_global_tier_stats');
        if (tierErr) throw tierErr;

        // Fetch 3: Rune Metrics
        const { data: runeData, error: runeErr } = await supabase!.rpc('get_global_rune_stats');
        if (runeErr) throw runeErr;

        // Map Tier Data
        const mappedTiers: GlobalStats['tiers'] = {
          S: { count: 0, pct: 0 },
          A: { count: 0, pct: 0 },
          B: { count: 0, pct: 0 },
          C: { count: 0, pct: 0 },
          Trash: { count: 0, pct: 0 },
          Skiller: { count: 0, pct: 0 },
        };

        if (Array.isArray(tierData)) {
          tierData.forEach((row: any) => {
            const tierName = row.tier;
            if (tierName in mappedTiers) {
              mappedTiers[tierName as keyof typeof mappedTiers] = {
                count: parseInt(row.item_count, 10) || 0,
                pct: parseFloat(row.percentage) || 0,
              };
            }
          });
        }

        // Map Rune Data
        const mappedRunes = Array.isArray(runeData)
          ? runeData.map((row: any) => ({
              god: row.god,
              count: parseInt(row.rune_count, 10) || 0,
              pct: parseFloat(row.percentage) || 0,
            }))
          : [];

        // Map Summary Row
        const summaryRow = Array.isArray(summaryData) ? summaryData[0] : summaryData;
        const summary = {
          totalRuns: parseInt(summaryRow?.total_runs, 10) || 0,
          totalItems: parseInt(summaryRow?.total_items, 10) || 0,
          totalRunes: parseInt(summaryRow?.total_runes, 10) || 0,
          totalEnchants: parseInt(summaryRow?.total_enchants, 10) || 0,
        };

        setGlobalStats({
          summary,
          tiers: mappedTiers,
          runes: mappedRunes,
        });
      } catch (err: any) {
        console.error('[Supabase Stats] Error fetching global statistics:', err);
        setGlobalError(err.message || 'Erro de rede. Exibindo dados simulados.');
        // Graceful fallback to simulated dataset
        setGlobalStats(MOCK_GLOBAL_STATS);
      } finally {
        setLoadingGlobal(false);
      }
    };

    fetchGlobal();
  }, [viewMode]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          <BarChart3 size={18} /> {t('statsTitle')}
        </h3>
        
        {/* Toggle Mode & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px', gap: '2px' }}>
            <button
              onClick={() => setViewMode('session')}
              style={{
                background: viewMode === 'session' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'session' ? '#000' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={11} /> {t('sessionView') || "Minha Sessão"}
            </button>
            <button
              onClick={() => setViewMode('global')}
              style={{
                background: viewMode === 'global' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'global' ? '#000' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Globe size={11} /> {t('globalView') || "Servidor (Global)"}
            </button>
          </div>

          {/* Reset button (visible on session mode only) */}
          {viewMode === 'session' && (
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
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={12} /> {showConfirm ? t('statsConfirmBtn') : t('statsResetBtn')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODE 1: LOCAL SESSION VIEW ────────────────────────────────────── */}
      {viewMode === 'session' && (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
          </div>

          {/* Local Tier Distribution */}
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

                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
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
        </>
      )}

      {/* ── MODE 2: GLOBAL SERVER VIEW ────────────────────────────────────── */}
      {viewMode === 'global' && (
        <>
          {loadingGlobal && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '12px' }}>
              <Loader size={28} className="spin" style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('loadingGlobalStats') || "Carregando estatísticas do servidor..."}</div>
            </div>
          )}

          {globalError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.78rem',
              color: '#ef4444',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ⚠ {globalError}
            </div>
          )}

          {!loadingGlobal && globalStats && (
            <div>
              {/* Global Stats Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(212,180,131,0.1)', color: 'var(--accent-primary)', padding: '8px', borderRadius: '6px' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsItemsEvaluated')}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{globalStats.summary.totalItems}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '6px' }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsParserRuns')}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{globalStats.summary.totalRuns}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '6px' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsTotalRunes') || "Runas Catalogadas"}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{globalStats.summary.totalRunes}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '8px', borderRadius: '6px' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('statsTotalEnchants') || "Encantamentos"}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{globalStats.summary.totalEnchants}</div>
                  </div>
                </div>
              </div>

              {/* Grid with Global Tiers & Rune Distribution */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                
                {/* Left side: Global Tier Distribution */}
                <div>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {t('statsQualityDistribution')} (Global)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(Object.keys(globalStats.tiers) as Array<keyof typeof globalStats.tiers>).map(tier => {
                      const row = globalStats.tiers[tier];
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`badge tier-${tier.toLowerCase()}`} style={{ 
                                fontSize: '0.75rem', 
                                padding: '2px 8px',
                                boxShadow: `0 0 8px ${color.glow}`
                              }}>
                                {tier === 'Skiller' ? '⚡ Skiller' : `Tier ${tier}`}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {row.count.toLocaleString()} {t('statsItemPlural')}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: color.text }}>{row.pct.toFixed(1)}%</span>
                          </div>

                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${row.pct}%`,
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
                </div>

                {/* Right side: Global Rune Deities Distribution */}
                <div>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {t('globalRuneTitle') || "Distribuição de Divindades (Runas Globais)"}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {globalStats.runes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                        Sem dados de runas disponíveis
                      </div>
                    ) : globalStats.runes.map(rune => {
                      const godName = rune.god;
                      const count = rune.count;
                      const pct = rune.pct;

                      return (
                        <div key={godName} style={{
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                textTransform: 'capitalize', 
                                fontWeight: 700, 
                                fontSize: '0.78rem',
                                color: 'var(--accent-primary)',
                                background: 'rgba(212, 180, 131, 0.08)',
                                border: '1px solid rgba(212, 180, 131, 0.2)',
                                borderRadius: '4px',
                                padding: '2px 8px'
                              }}>
                                {godName}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {count.toLocaleString()} runas
                              </span>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{pct.toFixed(1)}%</span>
                          </div>

                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'var(--accent-primary)',
                              borderRadius: '3px',
                              transition: 'width 0.4s ease-out'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
