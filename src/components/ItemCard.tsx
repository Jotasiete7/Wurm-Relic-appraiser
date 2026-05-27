import { useState } from 'react';
import type { WurmItem } from '../types';
import { Copy, ChevronDown, ChevronUp, Crown, Star, CheckCircle, AlertTriangle, Trash2, Image, FileText, Layers, Zap } from 'lucide-react';
import { EFFECT_DISPLAY_NAMES } from '../data/effectDisplayNames';

interface ItemCardProps {
  item: WurmItem;
  t: (key: any) => string;
}

const TIER_CONFIG = {
  S:       { icon: Crown,         label: 'S',        cls: 'tier-s'       },
  A:       { icon: Star,          label: 'A',        cls: 'tier-a'       },
  B:       { icon: CheckCircle,   label: 'B',        cls: 'tier-b'       },
  C:       { icon: AlertTriangle, label: 'C',        cls: 'tier-c'       },
  Trash:   { icon: Trash2,        label: 'Trash',    cls: 'tier-trash'   },
  Skiller: { icon: Zap,           label: 'Skiller',  cls: 'tier-skiller' },
};

const RARITY_COLOR: Record<string, string> = {
  rare:      '#60a5fa',
  supreme:   '#a78bfa',
  fantastic: '#f59e0b',
  common:    'transparent',
};

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

function getRuneAbbreviation(god: string, metal: string): string {
  const g = god.toLowerCase().trim();
  const m = metal.toLowerCase().trim();
  
  let metalAbbr = '';
  if (m === 'adamantine') metalAbbr = 'A';
  else if (m === 'brass') metalAbbr = 'B';
  else if (m === 'bronze') metalAbbr = 'BZ';
  else if (m === 'copper') metalAbbr = 'C';
  else if (m === 'glimmersteel') metalAbbr = 'GL';
  else if (m === 'gold') metalAbbr = 'G';
  else if (m === 'iron') metalAbbr = 'I';
  else if (m === 'lead') metalAbbr = 'L';
  else if (m === 'seryll') metalAbbr = 'S';
  else if (m === 'silver') metalAbbr = 'SV';
  else if (m === 'steel') metalAbbr = 'ST';
  else if (m === 'tin') metalAbbr = 'T';
  else if (m === 'zinc') metalAbbr = 'Z';
  else metalAbbr = m.charAt(0).toUpperCase();

  let godAbbr = '';
  if (g.startsWith('fo')) godAbbr = 'F';
  else if (g.startsWith('mag')) godAbbr = 'M';
  else if (g.startsWith('vyn')) godAbbr = 'V';
  else if (g.startsWith('lib')) godAbbr = 'L';
  else if (g.startsWith('jac')) godAbbr = 'J';
  else if (g.startsWith('the scavenger') || g.startsWith('scavenger')) godAbbr = 'S';
  else godAbbr = g.charAt(0).toUpperCase();

  return `R${metalAbbr}${godAbbr}`;
}

export function ItemCard({ item, t }: ItemCardProps) {
  const [showScore, setShowScore] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const tier = TIER_CONFIG[item.tier];
  const TierIcon = tier.icon;
  
  const getDataSourceLabel = (ds: string) => {
    if (ds === 'merged') return t('fullData');
    if (ds === 'screenshot_only') return t('missingRunes');
    return t('missingMetalQL');
  };

  const copyRename = () => {
    const tier = item.tier === 'Skiller' ? 'SKL' : item.tier;
    
    let bestRuneAbbr = '';
    if (item.scoreBreakdown.effectsScored && item.scoreBreakdown.effectsScored.length > 0) {
      let maxPoints = -999;
      let bestEffect = item.scoreBreakdown.effectsScored[0];
      for (const eff of item.scoreBreakdown.effectsScored) {
        if (eff.points > maxPoints) {
          maxPoints = eff.points;
          bestEffect = eff;
        }
      }
      const parts = bestEffect.runeName.toLowerCase().split(' of ');
      if (parts.length > 1) {
        const bestGod = parts[1].trim();
        const matchingRune = item.runes.find(r => r.god.toLowerCase().trim() === bestGod);
        if (matchingRune) {
          bestRuneAbbr = getRuneAbbreviation(matchingRune.god, matchingRune.metal);
        }
      }
    }
    
    if (!bestRuneAbbr && item.runes && item.runes.length > 0) {
      bestRuneAbbr = getRuneAbbreviation(item.runes[0].god, item.runes[0].metal);
    }
    
    const runePart = bestRuneAbbr ? ` ${bestRuneAbbr}` : '';
    const txt = `Tier ${tier}${runePart}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rarityColor = RARITY_COLOR[item.rarity] ?? 'transparent';

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
            {item.damage != null && item.damage > 1.0 && (
              <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.72rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', textTransform: 'none' }}>
                <AlertTriangle size={11} /> {t('repairNeeded')}
              </span>
            )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.72rem', color: item.dataSource === 'merged' ? '#10b981' : '#f97316' }}>
            {item.dataSource === 'merged' ? <Layers size={11} /> : item.dataSource === 'screenshot_only' ? <Image size={11} /> : <FileText size={11} />}
            <span>{getDataSourceLabel(item.dataSource)}</span>
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
        <span>{t('scoreLabel')}: <strong style={{ color: 'var(--text-primary)' }}>{item.score}</strong></span>
        <span>{t('runesLabel')}: <strong style={{ color: 'var(--text-primary)' }}>{item.runes.length}</strong></span>
        <span>{t('enchantsLabel')}: <strong style={{ color: 'var(--text-primary)' }}>{item.enchants.length}</strong></span>
      </div>

      {/* Unknown item notice */}
      {item.normalizedName === 'unknown' && item.descriptionRaw && (
        <div style={{ fontSize: '0.75rem', color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.75rem' }}>
          <strong>⚠ {t('notInDictionary')}</strong><br />
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
                <span style={{ fontSize: '0.7rem', color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{t('scavenger')}</span>
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
          <li className="rune-item" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{t('noRunes')}</li>
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

      {/* Imbui chips */}
      {item.imbuis && item.imbuis.length > 0 && (
        <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {item.imbuis.map((imb, i) => (
            <span key={i} style={{
              fontSize: '0.72rem',
              background: 'rgba(16,185,129,0.08)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '4px',
              padding: '2px 7px',
            }}>💧 {imb.name} [QL {imb.ql}]</span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button 
          onClick={copyRename} 
          style={{ 
            flex: 1, 
            justifyContent: 'center',
            background: copied ? '#10b981' : 'var(--accent-primary)',
            color: '#fff',
            transition: 'all 0.3s'
          }}
        >
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />} 
          {copied ? t('copied') : t('copyRename')}
        </button>
        <button
          onClick={() => setShowScore(!showScore)}
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '0.4rem 0.75rem' }}
          title={t('scoreBreakdownTitle')}
        >
          {showScore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Score breakdown */}
      {showScore && (
        <div className="score-breakdown">
          {item.isSkiller ? (
            <>
              {item.scoreBreakdown.enchantsScored.map((es, i) => (
                <div className="score-row" key={i}>
                  <span>✨ {es.name} [{es.power}] (Skiller)</span>
                  <span style={{ color: '#10b981' }}>{es.points}</span>
                </div>
              ))}
              <div className="score-total">
                <span>{t('totalLabel')}</span>
                <span>{item.scoreBreakdown.total} {t('pts')}</span>
              </div>
            </>
          ) : (
            <>
              {item.scoreBreakdown.effectsScored.map((es, i) => (
                <div className="score-row" key={i}>
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{EFFECT_DISPLAY_NAMES[es.effect]}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{t('fromRune')} {es.runeName}</span>
                  </span>
                  <span style={{ color: es.points > 0 ? '#10b981' : 'var(--text-muted)' }}>
                    {es.points > 0 ? `+${es.points}` : '0'}
                  </span>
                </div>
              ))}
              {item.scoreBreakdown.enchantsScored && item.scoreBreakdown.enchantsScored.map((es, i) => (
                <div className="score-row" key={`enc-${i}`}>
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>✨ {es.name} [{es.power}]</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{t('enchantBonusLabel')}</span>
                  </span>
                  <span style={{ color: es.points > 0 ? '#10b981' : 'var(--text-muted)' }}>
                    {es.points > 0 ? `+${es.points}` : '0'}
                  </span>
                </div>
              ))}
              <div className="score-row">
                <span>{t('metalLabel')} ({item.metal ?? t('none')})</span>
                <span style={{ color: item.scoreBreakdown.metalBonus > 0 ? '#10b981' : 'var(--text-muted)' }}>
                  {item.scoreBreakdown.metalBonus > 0 ? `+${item.scoreBreakdown.metalBonus}` : '0'}
                </span>
              </div>
              <div className="score-row">
                <span>{t('rarityLabel')} ({item.rarity})</span>
                <span style={{ color: item.scoreBreakdown.rarityBonus > 0 ? '#10b981' : 'var(--text-muted)' }}>
                  {item.scoreBreakdown.rarityBonus > 0 ? `+${item.scoreBreakdown.rarityBonus}` : '0'}
                </span>
              </div>
              <div className="score-total">
                <span>{t('totalLabel')}</span>
                <span>{item.scoreBreakdown.total} {t('pts')}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
