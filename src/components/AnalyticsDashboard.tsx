import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { BarChart3, TrendingUp, Sparkles, Zap, Loader, AlertTriangle, PieChart, Lightbulb } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

// ── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsDashboardProps {
  t: (key: keyof typeof TRANSLATIONS.en) => string;
}

interface SummaryData {
  totalRuns: number;
  totalItems: number;
  totalRunes: number;
  totalEnchants: number;
}

interface TierRow {
  tier: string;
  count: number;
  pct: number;
}

interface RuneRow {
  god: string;
  count: number;
  pct: number;
}

interface CategoryRow {
  category: string;
  count: number;
  pct: number;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA = {
  summary: { totalRuns: 234, totalItems: 8920, totalRunes: 5140, totalEnchants: 3780 },
  tiers: [
    { tier: 'S', count: 178, pct: 2.0 },
    { tier: 'A', count: 446, pct: 5.0 },
    { tier: 'B', count: 2230, pct: 25.0 },
    { tier: 'C', count: 3122, pct: 35.0 },
    { tier: 'Trash', count: 2944, pct: 33.0 },
  ],
  runes: [
    { god: 'fo', count: 2056, pct: 40.0 },
    { god: 'vynora', count: 1542, pct: 30.0 },
    { god: 'magranon', count: 1028, pct: 20.0 },
    { god: 'libila', count: 411, pct: 8.0 },
    { god: 'jackal', count: 103, pct: 2.0 },
  ],
  categories: [
    { category: 'tool_craft', count: 3568, pct: 40.0 },
    { category: 'weapon', count: 2676, pct: 30.0 },
    { category: 'armor', count: 1784, pct: 20.0 },
    { category: 'container', count: 892, pct: 10.0 },
  ],
};

// ── Constants ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  S: '#f59e0b',
  A: '#60a5fa',
  B: '#10b981',
  C: '#f97316',
  Trash: '#6b7280',
  Skiller: '#8b5cf6',
};

const CATEGORY_COLORS: Record<string, string> = {
  tool_craft: '#f59e0b',
  weapon: '#ef4444',
  armor: '#60a5fa',
  container: '#10b981',
  tool_mining: '#a78bfa',
  tool_gather: '#f472b6',
};

const CATEGORY_LABELS: Record<string, { pt: string; en: string }> = {
  tool_craft: { pt: 'Ferramentas', en: 'Tools' },
  weapon: { pt: 'Armas', en: 'Weapons' },
  armor: { pt: 'Armaduras', en: 'Armor' },
  container: { pt: 'Containers', en: 'Containers' },
  tool_mining: { pt: 'Mineração', en: 'Mining' },
  tool_gather: { pt: 'Coleta', en: 'Gathering' },
};

// ── Component ────────────────────────────────────────────────────────────────

export function AnalyticsDashboard({ t }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [tiers, setTiers] = useState<TierRow[]>([]);
  const [runes, setRunes] = useState<RuneRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSummary(MOCK_DATA.summary);
      setTiers(MOCK_DATA.tiers);
      setRunes(MOCK_DATA.runes);
      setCategories(MOCK_DATA.categories);
      setLoading(false);
      // Trigger animations after a brief paint delay
      requestAnimationFrame(() => setTimeout(() => setAnimated(true), 50));
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, tierRes, runeRes, catRes] = await Promise.all([
          supabase!.rpc('get_global_summary_stats'),
          supabase!.rpc('get_global_tier_stats'),
          supabase!.rpc('get_global_rune_stats'),
          supabase!.rpc('get_global_category_stats'),
        ]);

        if (summaryRes.error) throw summaryRes.error;
        if (tierRes.error) throw tierRes.error;
        if (runeRes.error) throw runeRes.error;
        if (catRes.error) throw catRes.error;

        // Map summary
        const sRow = Array.isArray(summaryRes.data) ? summaryRes.data[0] : summaryRes.data;
        setSummary({
          totalRuns: parseInt(sRow?.total_runs, 10) || 0,
          totalItems: parseInt(sRow?.total_items, 10) || 0,
          totalRunes: parseInt(sRow?.total_runes, 10) || 0,
          totalEnchants: parseInt(sRow?.total_enchants, 10) || 0,
        });

        // Map tiers
        if (Array.isArray(tierRes.data)) {
          setTiers(
            tierRes.data.map((r: any) => ({
              tier: r.tier,
              count: parseInt(r.item_count, 10) || 0,
              pct: parseFloat(r.percentage) || 0,
            }))
          );
        }

        // Map runes
        if (Array.isArray(runeRes.data)) {
          setRunes(
            runeRes.data.map((r: any) => ({
              god: r.god,
              count: parseInt(r.rune_count, 10) || 0,
              pct: parseFloat(r.percentage) || 0,
            }))
          );
        }

        // Map categories
        if (Array.isArray(catRes.data)) {
          setCategories(
            catRes.data.map((r: any) => ({
              category: r.category,
              count: parseInt(r.item_count, 10) || 0,
              pct: parseFloat(r.percentage) || 0,
            }))
          );
        }
      } catch (err: any) {
        console.error('[AnalyticsDashboard] Fetch error:', err);
        setError(err.message || 'Network error — showing simulated data.');
        // Graceful fallback
        setSummary(MOCK_DATA.summary);
        setTiers(MOCK_DATA.tiers);
        setRunes(MOCK_DATA.runes);
        setCategories(MOCK_DATA.categories);
      } finally {
        setLoading(false);
        requestAnimationFrame(() => setTimeout(() => setAnimated(true), 50));
      }
    };

    fetchAll();
  }, []);

  // ── Helper: format large numbers ────────────────────────────────────────
  const fmt = (n: number) => n.toLocaleString();

  // ── Helper: category display name ───────────────────────────────────────
  const catLabel = (key: string) => {
    const entry = CATEGORY_LABELS[key];
    if (!entry) return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return entry.pt; // Default to Portuguese (matches app language); en available as fallback
  };

  // ── Donut chart helpers ─────────────────────────────────────────────────
  const DONUT_RADIUS = 70;
  const DONUT_STROKE = 18;
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

  // ── Insights generator ──────────────────────────────────────────────────
  const generateInsights = (): string[] => {
    const insights: string[] = [];

    // Trash tier insight
    const trashTier = tiers.find(t => t.tier === 'Trash');
    if (trashTier) {
      insights.push(`${trashTier.pct.toFixed(0)}% de todos os itens avaliados são Trash tier — a caça ao tesouro é real! 🏴‍☠️`);
    }

    // Top rune god
    if (runes.length > 0) {
      const topGod = runes.reduce((a, b) => (a.pct > b.pct ? a : b));
      insights.push(`${topGod.god.charAt(0).toUpperCase() + topGod.god.slice(1)} é a divindade mais popular com ${topGod.pct.toFixed(0)}% de todas as runas 🌟`);
    }

    // Top category
    if (categories.length > 0) {
      const topCat = categories.reduce((a, b) => (a.pct > b.pct ? a : b));
      insights.push(`${catLabel(topCat.category)} é a categoria mais comum com ${topCat.pct.toFixed(0)}% dos itens ⚒️`);
    }

    return insights;
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="card" style={{ border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '16px' }}>
          <Loader size={32} style={{ color: 'var(--accent-primary)', animation: 'analytics-spin 1s linear infinite' }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {t('loadingGlobalStats') || 'Carregando estatísticas do servidor...'}
          </div>
        </div>
        <style>{`@keyframes analytics-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!summary) return null;

  const insights = generateInsights();

  // ── Build donut segments ────────────────────────────────────────────────
  let donutOffset = 0;
  const donutSegments = tiers.map((row) => {
    const segLength = (row.pct / 100) * DONUT_CIRCUMFERENCE;
    const segment = {
      tier: row.tier,
      color: TIER_COLORS[row.tier] || '#6b7280',
      dashArray: `${segLength} ${DONUT_CIRCUMFERENCE - segLength}`,
      dashOffset: -donutOffset,
      pct: row.pct,
      count: row.count,
    };
    donutOffset += segLength;
    return segment;
  });

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="card" style={{ marginTop: '2rem', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes analytics-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes analytics-donut-appear {
          from { opacity: 0; stroke-dashoffset: 1000; }
          to { opacity: 1; }
        }
        @keyframes analytics-bar-grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes analytics-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes analytics-number-pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Background radial ornament */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,180,131,0.04) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.15rem',
            color: 'var(--accent-primary)',
            fontWeight: 600,
          }}>
            <PieChart size={18} />
            {t('analyticsTitle') || '📊 Estatísticas Globais'}
          </h3>
          <p style={{
            margin: '4px 0 0',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}>
            {t('analyticsSubtitle') || 'Dados agregados de todas as análises da comunidade'}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.78rem',
          color: '#ef4444',
          marginBottom: '1rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── 1. Summary Cards ────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        {[
          { label: t('statsParserRuns') || 'Análises Realizadas', value: summary.totalRuns, icon: BarChart3, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: t('statsItemsEvaluated') || 'Itens Avaliados', value: summary.totalItems, icon: TrendingUp, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
          { label: t('statsTotalRunes') || 'Runas Catalogadas', value: summary.totalRunes, icon: Sparkles, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: t('statsTotalEnchants') || 'Encantamentos', value: summary.totalEnchants, icon: Zap, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '1.15rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                animation: animated ? `analytics-fade-up 0.5s ease ${i * 0.08}s both` : 'none',
              }}
            >
              <div style={{
                background: card.bg,
                color: card.color,
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '2px' }}>
                  {card.label}
                </div>
                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  animation: animated ? `analytics-number-pop 0.6s ease ${0.2 + i * 0.08}s both` : 'none',
                }}>
                  {fmt(card.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Grid ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem',
      }}>

        {/* ── 2. Donut Chart — Tier Distribution ────────────────────────── */}
        <div style={{
          animation: animated ? 'analytics-fade-up 0.5s ease 0.3s both' : 'none',
        }}>
          <h4 style={{
            margin: '0 0 1.25rem',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <PieChart size={15} style={{ color: 'var(--accent-primary)' }} />
            {t('analyticsTierDist') || 'Distribuição de Tiers'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            {/* SVG Donut */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              style={{ overflow: 'visible' }}
            >
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r={DONUT_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={DONUT_STROKE}
              />

              {/* Segments */}
              {donutSegments.map((seg, i) => (
                <circle
                  key={seg.tier}
                  cx="100"
                  cy="100"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={DONUT_STROKE}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  style={{
                    transition: animated ? `stroke-dasharray 0.8s ease ${0.1 * i}s, stroke-dashoffset 0.8s ease ${0.1 * i}s` : 'none',
                    opacity: animated ? 1 : 0,
                  }}
                />
              ))}

              {/* Center text */}
              <text
                x="100"
                y="94"
                textAnchor="middle"
                style={{
                  fill: 'var(--text-primary)',
                  fontSize: '22px',
                  fontWeight: 700,
                }}
              >
                {fmt(summary.totalItems)}
              </text>
              <text
                x="100"
                y="114"
                textAnchor="middle"
                style={{
                  fill: 'var(--text-muted)',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {t('statsItemsEvaluated') || 'itens'}
              </text>
            </svg>

            {/* Legend */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px 18px',
            }}>
              {donutSegments.map((seg) => (
                <div key={seg.tier} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: seg.color,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${seg.color}44`,
                  }} />
                  <span style={{ fontWeight: 600 }}>{seg.tier}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{seg.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Horizontal Bar Chart — Rune Gods ───────────────────────── */}
        <div style={{
          animation: animated ? 'analytics-fade-up 0.5s ease 0.4s both' : 'none',
        }}>
          <h4 style={{
            margin: '0 0 1.25rem',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
            {t('analyticsRuneDist') || 'Divindades das Runas'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {runes.map((row, i) => {
              const maxPct = Math.max(...runes.map(r => r.pct), 1);
              const barWidthPct = (row.pct / maxPct) * 100;
              const opacityStep = 1 - (i * 0.12);

              return (
                <div key={row.god} style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 60px',
                  alignItems: 'center',
                  gap: '10px',
                  animation: animated ? `analytics-fade-up 0.4s ease ${0.4 + i * 0.08}s both` : 'none',
                }}>
                  {/* God name */}
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    textTransform: 'capitalize',
                  }}>
                    {row.god}
                  </span>

                  {/* Bar */}
                  <div style={{
                    width: '100%',
                    height: '22px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{
                      width: animated ? `${barWidthPct}%` : '0%',
                      height: '100%',
                      background: `var(--accent-primary)`,
                      opacity: opacityStep,
                      borderRadius: '4px',
                      transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                      transitionDelay: `${0.3 + i * 0.1}s`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '8px',
                    }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#000',
                        whiteSpace: 'nowrap',
                        opacity: barWidthPct > 25 ? 1 : 0,
                      }}>
                        {row.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Count */}
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    textAlign: 'right',
                  }}>
                    {fmt(row.count)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Item Categories Bar Chart ─────────────────────────────────── */}
      <div style={{
        marginBottom: '2.5rem',
        animation: animated ? 'analytics-fade-up 0.5s ease 0.5s both' : 'none',
      }}>
        <h4 style={{
          margin: '0 0 1.25rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <BarChart3 size={15} style={{ color: 'var(--accent-primary)' }} />
          {t('analyticsCatDist') || 'Categorias de Itens'}
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '10px',
        }}>
          {categories.map((row, i) => {
            const maxPct = Math.max(...categories.map(c => c.pct), 1);
            const barWidthPct = (row.pct / maxPct) * 100;
            const color = CATEGORY_COLORS[row.category] || 'var(--accent-primary)';

            return (
              <div key={row.category} style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                animation: animated ? `analytics-fade-up 0.4s ease ${0.5 + i * 0.08}s both` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      background: color,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {catLabel(row.category)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {fmt(row.count)}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>
                      {row.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: animated ? `${barWidthPct}%` : '0%',
                    height: '100%',
                    background: color,
                    borderRadius: '3px',
                    transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: `${0.4 + i * 0.1}s`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Insight Cards ─────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <div style={{
          animation: animated ? 'analytics-fade-up 0.5s ease 0.7s both' : 'none',
        }}>
          <h4 style={{
            margin: '0 0 1rem',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Lightbulb size={15} style={{ color: '#f59e0b' }} />
            {t('analyticsInsights') || '💡 Insights da Comunidade'}
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {insights.map((text, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(245, 158, 11, 0.04)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  animation: animated ? `analytics-fade-up 0.4s ease ${0.7 + i * 0.1}s both` : 'none',
                }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>💡</span>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
