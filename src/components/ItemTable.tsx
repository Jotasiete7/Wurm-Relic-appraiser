import React, { useState } from 'react';
import type { WurmItem } from '../types';
import { Copy, ChevronDown, ChevronUp, Crown, Star, CheckCircle, AlertTriangle, Trash2, Image, FileText, Layers } from 'lucide-react';
import { EFFECT_DISPLAY_NAMES } from '../data/effectDisplayNames';

interface ItemTableProps {
  items: WurmItem[];
}

const TIER_CONFIG = {
  S:     { icon: Crown,         cls: 'tier-s',     label: 'S' },
  A:     { icon: Star,          cls: 'tier-a',     label: 'A' },
  B:     { icon: CheckCircle,   cls: 'tier-b',     label: 'B' },
  C:     { icon: AlertTriangle, cls: 'tier-c',     label: 'C' },
  Trash: { icon: Trash2,        cls: 'tier-trash', label: '✕' },
};

const RARITY_COLOR: Record<string, string> = {
  rare:      '#60a5fa',
  supreme:   '#a78bfa',
  fantastic: '#f59e0b',
  common:    'var(--text-primary)',
};

const DS_ICON = {
  merged:          Layers,
  screenshot_only: Image,
  examine_only:    FileText,
};

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

function copyRename(item: WurmItem) {
  const metalStr = item.metal ? ` ${item.metal}` : '';
  const qlStr    = item.ql != null ? ` ql${Math.floor(item.ql)}` : '';
  navigator.clipboard.writeText(`[${item.tier}] ${item.normalizedName}${metalStr}${qlStr}`);
}

function ItemRow({ item }: { item: WurmItem }) {
  const [open, setOpen] = useState(false);
  const tier = TIER_CONFIG[item.tier];
  const TierIcon = tier.icon;
  const DsIcon = DS_ICON[item.dataSource];
  const rarityColor = RARITY_COLOR[item.rarity] ?? 'var(--text-primary)';
  const borderColor = item.rarity !== 'common' ? rarityColor : 'transparent';

  const runeEffects = item.runes.flatMap(r => r.effects);
  const hasUsageSpeed = runeEffects.includes('USAGE_SPEED');

  return (
    <>
      {/* Main row */}
      <tr
        onClick={() => setOpen(o => !o)}
        style={{
          cursor: 'pointer',
          borderLeft: `3px solid ${borderColor}`,
          background: open ? 'var(--bg-card-hover)' : 'transparent',
          transition: 'background 0.15s',
        }}
        className="item-row"
      >
        {/* Tier badge */}
        <td style={{ padding: '10px 8px', width: '52px' }}>
          <span className={`badge ${tier.cls}`} style={{ padding: '3px 8px', gap: '4px', fontSize: '0.75rem', minWidth: '40px', justifyContent: 'center' }}>
            <TierIcon size={11} />
            {tier.label}
          </span>
        </td>

        {/* Name */}
        <td style={{ padding: '10px 8px' }}>
          <span style={{ fontWeight: 600, color: rarityColor }}>
            {item.rarity !== 'common' && (
              <span style={{ fontSize: '0.75rem', marginRight: '4px', fontWeight: 400, textTransform: 'capitalize' }}>
                {item.rarity}
              </span>
            )}
            {toTitleCase(item.normalizedName)}
          </span>
          {item.playerNote && (
            <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ({item.playerNote})
            </span>
          )}
        </td>

        {/* Metal */}
        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', textTransform: 'capitalize', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
          {item.metal ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
        </td>

        {/* QL */}
        <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {item.ql != null ? item.ql.toFixed(1) : <span style={{ color: 'var(--text-muted)' }}>?</span>}
        </td>

        {/* Rune summary */}
        <td style={{ padding: '10px 8px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            {item.runes.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>no runes</span>
            ) : item.runes.map((r, i) => (
              <span key={i} style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: r.effects.includes('USAGE_SPEED')
                  ? 'rgba(59,130,246,0.15)'
                  : 'var(--bg-panel)',
                border: `1px solid ${r.effects.includes('USAGE_SPEED') ? 'rgba(59,130,246,0.4)' : 'var(--border-color)'}`,
                color: r.effects.includes('USAGE_SPEED') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}>
                {r.metal} of {r.god}
              </span>
            ))}
            {item.enchants.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                +{item.enchants.length} enc
              </span>
            )}
          </div>
        </td>

        {/* Score */}
        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
          <span style={{ color: item.score >= 55 ? '#10b981' : item.score >= 30 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            {item.score}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '2px' }}>pts</span>
        </td>

        {/* Data source + actions */}
        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <DsIcon size={13} style={{ color: item.dataSource === 'merged' ? '#10b981' : '#f97316', flexShrink: 0 }} />
            <button
              onClick={e => { e.stopPropagation(); copyRename(item); }}
              title="Copy rename string"
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                padding: '3px 8px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Copy size={11} />
              Copy
            </button>
            <span style={{ color: 'var(--text-muted)' }}>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr style={{ background: 'var(--bg-panel)' }}>
          <td colSpan={7} style={{ padding: '0 0 0 52px' }}>
            <div style={{ padding: '12px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* Left: Runes */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Runes</div>
                {item.runes.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No runes attached</div>
                ) : item.runes.map((rune, i) => (
                  <div key={i} style={{
                    marginBottom: '8px',
                    padding: '8px 10px',
                    background: 'var(--bg-card)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ textTransform: 'capitalize' }}>{rune.metal} of {rune.god}</strong>
                      {rune.source === 'unknown' && (
                        <span style={{ fontSize: '0.68rem', color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '1px 5px', borderRadius: '3px' }}>scavenger</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {rune.effects.map((eff, j) => (
                        <span key={j} style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent-primary)',
                          fontWeight: 600,
                        }}>
                          {EFFECT_DISPLAY_NAMES[eff]}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', fontStyle: 'italic' }}>
                      {rune.rawEffectString}
                    </div>
                  </div>
                ))}

                {/* Enchants */}
                {item.enchants.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '4px' }}>Enchants</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.enchants.map((enc, i) => (
                        <span key={i} style={{
                          fontSize: '0.72rem',
                          background: 'rgba(59,130,246,0.1)',
                          color: 'var(--accent-primary)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          borderRadius: '4px',
                          padding: '2px 7px',
                        }}>✨ {enc.name} [{enc.power}]</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unknown item warning */}
                {item.normalizedName === 'unknown' && item.descriptionRaw && (
                  <div style={{ fontSize: '0.75rem', color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '6px', padding: '8px', marginTop: '8px' }}>
                    <strong>⚠ Item not in dictionary:</strong><br />
                    <em style={{ color: 'var(--text-muted)' }}>{item.descriptionRaw}</em>
                  </div>
                )}
              </div>

              {/* Right: Score breakdown */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Score Breakdown</div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  {item.scoreBreakdown.effectsScored.length === 0 ? (
                    <div style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No effects scored</div>
                  ) : item.scoreBreakdown.effectsScored.map((es, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.78rem',
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)' }}>{EFFECT_DISPLAY_NAMES[es.effect]}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontStyle: 'italic', textTransform: 'capitalize' }}>from {es.runeName}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: es.points > 0 ? '#10b981' : 'var(--text-muted)' }}>
                        {es.points > 0 ? `+${es.points}` : '0'}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <span>Metal ({item.metal ?? 'none'})</span>
                    <span style={{ color: item.scoreBreakdown.metalBonus > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                      {item.scoreBreakdown.metalBonus > 0 ? `+${item.scoreBreakdown.metalBonus}` : '0'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <span>Rarity ({item.rarity})</span>
                    <span style={{ color: item.scoreBreakdown.rarityBonus > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                      {item.scoreBreakdown.rarityBonus > 0 ? `+${item.scoreBreakdown.rarityBonus}` : '0'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem' }}>
                    <span>Total</span>
                    <span>{item.scoreBreakdown.total} pts</span>
                  </div>
                </div>

                {/* Rename string preview */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Rename String</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{
                      flex: 1,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      fontSize: '0.78rem',
                      color: 'var(--accent-primary)',
                    }}>
                      [{item.tier}] {item.normalizedName}{item.metal ? ` ${item.metal}` : ''}{item.ql != null ? ` ql${Math.floor(item.ql)}` : ''}
                    </code>
                    <button
                      onClick={e => { e.stopPropagation(); copyRename(item); }}
                      style={{ padding: '5px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ItemTable({ items }: ItemTableProps) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No items yet — fill in the inputs above and click Analyze.
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => b.score - a.score);

  return (
    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-panel)' }}>
            <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '52px' }}>Tier</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metal</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QL</th>
            <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Runes</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
            <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(item => (
            <ItemRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
