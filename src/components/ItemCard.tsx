import React, { useState } from 'react';
import type { WurmItem } from '../types';
import { Copy, ChevronDown, ChevronUp, Crown, Star, CheckCircle, AlertTriangle, Trash2, Image, FileText, Layers } from 'lucide-react';
import { EFFECT_DISPLAY_NAMES } from '../data/effectDisplayNames';

interface ItemCardProps {
  item: WurmItem;
}

const TIER_CONFIG = {
  S:     { icon: Crown,         label: 'S',     cls: 'tier-s'     },
  A:     { icon: Star,          label: 'A',     cls: 'tier-a'     },
  B:     { icon: CheckCircle,   label: 'B',     cls: 'tier-b'     },
  C:     { icon: AlertTriangle, label: 'C',     cls: 'tier-c'     },
  Trash: { icon: Trash2,        label: 'Trash', cls: 'tier-trash' },
};

const RARITY_COLOR: Record<string, string> = {
  rare:      '#60a5fa',
  supreme:   '#a78bfa',
  fantastic: '#f59e0b',
  common:    'transparent',
};

const DATA_SOURCE_CONFIG = {
  merged:           { icon: Layers,    label: 'Full data',         color: '#10b981' },
  screenshot_only:  { icon: Image,     label: 'Missing rune data', color: '#f97316' },
  examine_only:     { icon: FileText,  label: 'Missing metal/QL',  color: '#f97316' },
};

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

export function ItemCard({ item }: ItemCardProps) {
  const [showScore, setShowScore] = useState(false);
  const tier = TIER_CONFIG[item.tier];
  const TierIcon = tier.icon;
  const ds = DATA_SOURCE_CONFIG[item.dataSource];
  const DsIcon = ds.icon;
  const rarityColor = RARITY_COLOR[item.rarity] ?? 'transparent';

  const copyRename = () => {
    const metalStr = item.metal ? ` ${item.metal}` : '';
    const qlStr    = item.ql != null ? ` ql${Math.floor(item.ql)}` : '';
    navigator.clipboard.writeText(`[${item.tier}] ${item.normalizedName}${metalStr}${qlStr}`);
  };

  return (
    <div className="card" style={{ borderLeft: `4px solid ${rarityColor !== 'transparent' ? rarityColor : 'var(--border-color)'}` }}>
      {/* Header */}
      <div className="card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {item.rarity !== 'common' && (
              <span style={{ color: rarityColor, fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 500 }}>
                {item.rarity}
              </span>
            )}
            {item.metal && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                {item.metal}
              </span>
            )}
            <span>{toTitleCase(item.normalizedName)}</span>
          </h3>
          <div className="card-subtitle" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>QL: {item.ql != null ? item.ql.toFixed(2) : '?'}</span>
            <span>Dam: {item.damage != null ? item.damage.toFixed(2) : '?'}</span>
            <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
            {item.playerNote && (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>({item.playerNote})</span>
            )}
          </div>
          {/* DataSource badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.72rem', color: ds.color }}>
            <DsIcon size={11} />
            <span>{ds.label}</span>
          </div>
        </div>
        {/* Tier Badge */}
        <div className={`badge ${tier.cls}`} style={{ flexShrink: 0, flexDirection: 'column', gap: '2px', minWidth: '52px', textAlign: 'center' }}>
          <TierIcon size={16} />
          <span>{tier.label}</span>
        </div>
      </div>

      {/* Score summary */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', gap: '1rem' }}>
        <span>Score: <strong style={{ color: 'var(--text-primary)' }}>{item.score}</strong></span>
        <span>Runes: <strong style={{ color: 'var(--text-primary)' }}>{item.runes.length}</strong></span>
        <span>Enchants: <strong style={{ color: 'var(--text-primary)' }}>{item.enchants.length}</strong></span>
      </div>

      {/* Unknown item notice */}
      {item.normalizedName === 'unknown' && item.descriptionRaw && (
        <div style={{ fontSize: '0.75rem', color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.75rem' }}>
          <strong>⚠ Item not in dictionary.</strong> Raw description:<br />
          <em style={{ color: 'var(--text-muted)' }}>{item.descriptionRaw}</em>
        </div>
      )}

      {/* Rune list */}
      <ul className="rune-list">
        {item.runes.map((rune, i) => (
          <li key={i} className="rune-item">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ textTransform: 'capitalize' }}>{rune.metal} of {rune.god}</strong>
              {rune.source === 'unknown' && (
                <span style={{ fontSize: '0.7rem', color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '1px 6px', borderRadius: '4px' }}>scavenger</span>
              )}
            </div>
            <div style={{ marginTop: '3px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {rune.effects.map((eff, j) => (
                <span key={j} className="rune-effect" style={{ fontSize: '0.78rem' }}>
                  {EFFECT_DISPLAY_NAMES[eff]}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', fontStyle: 'italic' }}>
              {rune.rawEffectString}
            </div>
          </li>
        ))}
        {item.runes.length === 0 && (
          <li className="rune-item" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No runes attached</li>
        )}
      </ul>

      {/* Enchant chips */}
      {item.enchants.length > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button onClick={copyRename} style={{ flex: 1, justifyContent: 'center' }}>
          <Copy size={14} /> Copy Rename
        </button>
        <button
          onClick={() => setShowScore(!showScore)}
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '0.4rem 0.75rem' }}
          title="Score breakdown"
        >
          {showScore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Score breakdown */}
      {showScore && (
        <div className="score-breakdown">
          {item.scoreBreakdown.effectsScored.map((es, i) => (
            <div className="score-row" key={i}>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{EFFECT_DISPLAY_NAMES[es.effect]}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>from {es.runeName}</span>
              </span>
              <span style={{ color: es.points > 0 ? '#10b981' : 'var(--text-muted)' }}>
                {es.points > 0 ? `+${es.points}` : '0'}
              </span>
            </div>
          ))}
          <div className="score-row">
            <span>Metal ({item.metal ?? 'none'})</span>
            <span style={{ color: item.scoreBreakdown.metalBonus > 0 ? '#10b981' : 'var(--text-muted)' }}>
              {item.scoreBreakdown.metalBonus > 0 ? `+${item.scoreBreakdown.metalBonus}` : '0'}
            </span>
          </div>
          <div className="score-row">
            <span>Rarity ({item.rarity})</span>
            <span style={{ color: item.scoreBreakdown.rarityBonus > 0 ? '#10b981' : 'var(--text-muted)' }}>
              {item.scoreBreakdown.rarityBonus > 0 ? `+${item.scoreBreakdown.rarityBonus}` : '0'}
            </span>
          </div>
          <div className="score-total">
            <span>Total</span>
            <span>{item.scoreBreakdown.total} pts</span>
          </div>
        </div>
      )}
    </div>
  );
}
