import { useState, useMemo } from 'react';
import type { WurmItem } from '../types';
import { Copy, ChevronDown, ChevronUp, Crown, Star, CheckCircle, AlertTriangle, Trash2, Image, FileText, Layers, Zap, Search } from 'lucide-react';
import { EFFECT_DISPLAY_NAMES } from '../data/effectDisplayNames';

const CATEGORY_NAMES: Record<string, { en: string; pt: string }> = {
  tool_craft: { en: 'Craft Tools', pt: 'Ferramentas de Craft' },
  tool_mining: { en: 'Mining Tools', pt: 'Ferramentas de Mineração' },
  tool_gather: { en: 'Gathering Tools', pt: 'Ferramentas de Coleta' },
  tool_misc: { en: 'Misc Tools', pt: 'Ferramentas Diversas' },
  weapon: { en: 'Weapons', pt: 'Armas' },
  armor: { en: 'Armor', pt: 'Armaduras' },
  container: { en: 'Containers', pt: 'Recipientes' },
};

interface ItemTableProps {
  items: WurmItem[];
  t: (key: any) => string;
}

const TIER_CONFIG = {
  S:       { icon: Crown,         cls: 'tier-s',       label: 'S'       },
  A:       { icon: Star,          cls: 'tier-a',       label: 'A'       },
  B:       { icon: CheckCircle,   cls: 'tier-b',       label: 'B'       },
  C:       { icon: AlertTriangle, cls: 'tier-c',       label: 'C'       },
  Trash:   { icon: Trash2,        cls: 'tier-trash',   label: 'Trash'   },
  Skiller: { icon: Zap,           cls: 'tier-skiller', label: 'SKL'     },
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

function copyRenameText(item: WurmItem) {
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
  return `Tier ${tier}${runePart}`;
}

function ItemRow({ item, t }: { item: WurmItem; t: (key: any) => string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const tier = TIER_CONFIG[item.tier];
  const TierIcon = tier.icon;
  const DsIcon = DS_ICON[item.dataSource];
  const rarityColor = RARITY_COLOR[item.rarity] ?? 'var(--text-primary)';
  const borderColor = item.rarity !== 'common' ? rarityColor : 'transparent';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const txt = copyRenameText(item);
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDataSourceLabel = (ds: string) => {
    if (ds === 'merged') return t('fullData');
    if (ds === 'screenshot_only') return t('missingRunes');
    return t('missingMetalQL');
  };

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
        <td style={{ padding: '10px 8px', width: '80px' }}>
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
          {item.damage != null && item.damage > 1.0 && (
            <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.65rem', fontWeight: 600, padding: '1px 4px', borderRadius: '3px', marginLeft: '6px', whiteSpace: 'nowrap' }}>
              ⚠ {t('repairNeeded')}
            </span>
          )}
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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('noRunesRow')}</span>
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
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '2px' }}>{t('pts')}</span>
        </td>

        {/* Data source + actions */}
        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <span title={getDataSourceLabel(item.dataSource)} style={{ display: 'inline-flex' }}>
              <DsIcon size={13} style={{ color: item.dataSource === 'merged' ? '#10b981' : '#f97316', flexShrink: 0 }} />
            </span>
            <button
              onClick={handleCopy}
              title={t('copyRename')}
              style={{
                background: copied ? '#10b981' : 'var(--bg-panel)',
                border: `1px solid ${copied ? '#10b981' : 'var(--border-color)'}`,
                color: copied ? '#fff' : 'var(--text-primary)',
                padding: '3px 8px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.3s',
                width: '85px',
                justifyContent: 'center',
              }}
            >
              {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
              {copied ? t('copied') : t('copyLabel')}
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('runesLabel')}</div>
                {item.runes.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('noRunes')}</div>
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
                        <span style={{ fontSize: '0.68rem', color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '1px 5px', borderRadius: '3px' }}>{t('scavenger')}</span>
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
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '4px' }}>{t('enchantsLabel')}</div>
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

                {/* Imbuis */}
                {item.imbuis && item.imbuis.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{t('imbuisLabel')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.imbuis.map((imb, i) => (
                        <span key={i} style={{
                          fontSize: '0.72rem',
                          background: 'rgba(16,185,129,0.1)',
                          color: '#10b981',
                          border: '1px solid rgba(16,185,129,0.2)',
                          borderRadius: '4px',
                          padding: '2px 7px',
                        }}>💧 {imb.name} [QL {imb.ql}]</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unknown item warning */}
                {item.normalizedName === 'unknown' && item.descriptionRaw && (
                  <div style={{ fontSize: '0.75rem', color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '6px', padding: '8px', marginTop: '8px' }}>
                    <strong>⚠ {t('notInDictionary')}</strong><br />
                    <em style={{ color: 'var(--text-muted)' }}>{item.descriptionRaw}</em>
                  </div>
                )}
              </div>

              {/* Right: Score breakdown */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{t('scoreBreakdownTitle')}</div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  {item.isSkiller ? (
                    <>
                      {item.scoreBreakdown.enchantsScored.map((es, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border-color)',
                          fontSize: '0.78rem',
                        }}>
                          <span>✨ {es.name} [{es.power}] (Skiller)</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{es.points}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem' }}>
                        <span>{t('totalLabel')}</span>
                        <span>{item.scoreBreakdown.total} {t('pts')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {item.scoreBreakdown.effectsScored.length === 0 ? (
                        <div style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('noEffectsScored')}</div>
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
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontStyle: 'italic', textTransform: 'capitalize' }}>{t('fromRune')} {es.runeName}</div>
                          </div>
                          <span style={{ fontWeight: 700, color: es.points > 0 ? '#10b981' : 'var(--text-muted)' }}>
                            {es.points > 0 ? `+${es.points}` : '0'}
                          </span>
                        </div>
                      ))}
                      {item.scoreBreakdown.enchantsScored && item.scoreBreakdown.enchantsScored.map((es, i) => (
                        <div key={`enc-${i}`} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderBottom: '1px solid var(--border-color)',
                          fontSize: '0.78rem',
                        }}>
                          <div>
                            <div style={{ color: 'var(--text-secondary)' }}>✨ {es.name} [{es.power}]</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontStyle: 'italic' }}>{t('enchantBonusLabel')}</div>
                          </div>
                          <span style={{ fontWeight: 700, color: es.points > 0 ? '#10b981' : 'var(--text-muted)' }}>
                            {es.points > 0 ? `+${es.points}` : '0'}
                          </span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <span>{t('metalLabel')} ({item.metal ?? t('none')})</span>
                        <span style={{ color: item.scoreBreakdown.metalBonus > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                          {item.scoreBreakdown.metalBonus > 0 ? `+${item.scoreBreakdown.metalBonus}` : '0'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', fontSize: '0.78rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <span>{t('rarityLabel')} ({item.rarity})</span>
                        <span style={{ color: item.scoreBreakdown.rarityBonus > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                          {item.scoreBreakdown.rarityBonus > 0 ? `+${item.scoreBreakdown.rarityBonus}` : '0'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontWeight: 700, fontSize: '0.85rem' }}>
                        <span>{t('totalLabel')}</span>
                        <span>{item.scoreBreakdown.total} {t('pts')}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Rename string preview */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{t('renameStringLabel')}</div>
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
                      {copyRenameText(item)}
                    </code>
                    <button
                      onClick={handleCopy}
                      style={{ 
                        padding: '5px 10px', 
                        fontSize: '0.78rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        whiteSpace: 'nowrap',
                        background: copied ? '#10b981' : 'var(--accent-primary)',
                        color: '#fff',
                        transition: 'all 0.3s'
                      }}
                    >
                      {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                      {copied ? t('copied') : t('copyLabel')}
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

function generateMarkdownTable(items: WurmItem[], t: (key: any) => string): string {
  const normalItems = items.filter(i => !i.isSkiller).sort((a, b) => b.score - a.score);
  const skillerItems = items.filter(i => i.isSkiller).sort((a, b) => b.score - a.score);
  const sorted = [...normalItems, ...skillerItems];

  let md = `| Tier | ${t('tblHeaderItem')} | ${t('tblMetal')} | ${t('tblQL')} | ${t('tblHeaderRunes')} | ${t('tblHeaderScore')} |\n`;
  md += `| :--- | :--- | :--- | :---: | :--- | :---: |\n`;

  for (const item of sorted) {
    const tier = item.tier;
    const name = toTitleCase(item.normalizedName);
    const rarity = item.rarity !== 'common' ? ` (${item.rarity})` : '';
    const metal = item.metal ? toTitleCase(item.metal) : '—';
    const ql = item.ql != null ? item.ql.toFixed(1) : '?';
    
    const runesList = item.runes.map(r => `${toTitleCase(r.metal)} of ${toTitleCase(r.god)}`).join(', ');
    const enchantsCount = item.enchants.length > 0 ? ` (+${item.enchants.length} enc)` : '';
    const runesStr = runesList ? `${runesList}${enchantsCount}` : t('noRunesRow');
    
    md += `| [**${tier}**] | ${name}${rarity} | ${metal} | ${ql} | ${runesStr} | **${item.score}** |\n`;
  }
  return md;
}

function generateBBCodeTable(items: WurmItem[], t: (key: any) => string): string {
  const normalItems = items.filter(i => !i.isSkiller).sort((a, b) => b.score - a.score);
  const skillerItems = items.filter(i => i.isSkiller).sort((a, b) => b.score - a.score);
  const sorted = [...normalItems, ...skillerItems];

  const colors = {
    S: '#f59e0b',
    A: '#a78bfa',
    B: '#60a5fa',
    C: '#3b82f6',
    Trash: '#9ca3af',
    Skiller: '#10b981',
  };

  let bb = `[table]\n`;
  bb += `[tr][th]Tier[/th][th]${t('tblHeaderItem')}[/th][th]${t('tblMetal')}[/th][th]${t('tblQL')}[/th][th]${t('tblHeaderRunes')}[/th][th]${t('tblHeaderScore')}[/th][/tr]\n`;

  for (const item of sorted) {
    const tierColor = colors[item.tier as keyof typeof colors] || '#ffffff';
    const name = toTitleCase(item.normalizedName);
    const rarity = item.rarity !== 'common' ? ` (${toTitleCase(item.rarity)})` : '';
    const metal = item.metal ? toTitleCase(item.metal) : '-';
    const ql = item.ql != null ? item.ql.toFixed(1) : '?';
    
    const runesList = item.runes.map(r => `${toTitleCase(r.metal)} of ${toTitleCase(r.god)}`).join(', ');
    const enchantsCount = item.enchants.length > 0 ? ` (+${item.enchants.length} enc)` : '';
    const runesStr = runesList ? `${runesList}${enchantsCount}` : t('noRunesRow');

    bb += `[tr]`;
    bb += `[td][b][color=${tierColor}]${item.tier}[/color][/b][/td]`;
    bb += `[td]${name}${rarity}[/td]`;
    bb += `[td]${metal}[/td]`;
    bb += `[td]${ql}[/td]`;
    bb += `[td]${runesStr}[/td]`;
    bb += `[td][b]${item.score}[/b][/td]`;
    bb += `[/tr]\n`;
  }
  bb += `[/table]`;
  return bb;
}

export function ItemTable({ items, t }: ItemTableProps) {
  const [mdCopied, setMdCopied] = useState(false);
  const [bbCopied, setBbCopied] = useState(false);

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRune, setSelectedRune] = useState<string>('all');
  const [sortField, setSortField] = useState<'score' | 'ql' | 'name' | 'tier' | 'rarity' | 'metal'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Detect current language to localize category names
  // A simple heuristic based on the translation hook or current key resolution
  const isPt = t('newAnalysis') === 'Nova Análise';
  const langKey = isPt ? 'pt' : 'en';

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        {t('noItemsYetNotice')}
      </div>
    );
  }

  // 1. Get unique Runes & Categories dynamically from current haul for exact filtering
  const uniqueRunes = useMemo(() => {
    const runes = new Set<string>();
    items.forEach(item => {
      item.runes.forEach(r => {
        runes.add(`${r.metal} of ${r.god}`);
      });
    });
    return Array.from(runes).sort();
  }, [items]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(items.map(item => item.category))).sort();
  }, [items]);

  // 2. Filter list of items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // A. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.normalizedName.toLowerCase().includes(query);
        const matchesNote = item.playerNote?.toLowerCase().includes(query) ?? false;
        const matchesMaker = item.maker?.toLowerCase().includes(query) ?? false;
        const matchesMetal = item.metal?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesNote && !matchesMaker && !matchesMetal) {
          return false;
        }
      }

      // B. Tier Filter
      if (selectedTier !== 'all' && item.tier !== selectedTier) {
        return false;
      }

      // C. Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // D. Rune Filter
      if (selectedRune !== 'all') {
        const hasRune = item.runes.some(r => `${r.metal} of ${r.god}` === selectedRune);
        if (!hasRune) return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedTier, selectedCategory, selectedRune]);

  // 3. Sort list of items
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    
    const tierRanks: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, Trash: 1, Skiller: 6 };
    const rarityRanks: Record<string, number> = { fantastic: 4, supreme: 3, rare: 2, common: 1 };

    list.sort((a, b) => {
      let valA: any = a[sortField as keyof typeof a];
      let valB: any = b[sortField as keyof typeof b];

      // Handle custom properties
      if (sortField === 'name') {
        valA = a.normalizedName;
        valB = b.normalizedName;
      } else if (sortField === 'tier') {
        valA = tierRanks[a.tier] || 0;
        valB = tierRanks[b.tier] || 0;
      } else if (sortField === 'rarity') {
        valA = rarityRanks[a.rarity] || 0;
        valB = rarityRanks[b.rarity] || 0;
      } else if (sortField === 'ql') {
        valA = a.ql ?? -1;
        valB = b.ql ?? -1;
      } else if (sortField === 'metal') {
        valA = a.metal ?? '';
        valB = b.metal ?? '';
      }

      if (valA === valB) return 0;
      
      const comparison = valA > valB ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredItems, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending on new fields
    }
  };

  const handleCopyMd = () => {
    const md = generateMarkdownTable(sortedItems, t);
    navigator.clipboard.writeText(md);
    setMdCopied(true);
    setTimeout(() => setMdCopied(false), 2000);
  };

  const handleCopyBb = () => {
    const bb = generateBBCodeTable(sortedItems, t);
    navigator.clipboard.writeText(bb);
    setBbCopied(true);
    setTimeout(() => setBbCopied(false), 2000);
  };

  // Helper to render sort icon indicators
  const renderSortIndicator = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={12} style={{ marginLeft: '4px' }} /> : <ChevronDown size={12} style={{ marginLeft: '4px' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* ── ADVANCED FILTERS PANEL ────────────────────────────────────────── */}
      <div className="card" style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        padding: '1.25rem',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Input */}
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder') || "Buscar item, maker, nota…"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Tier Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              style={{
                padding: '8px 24px 8px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">{t('filterAll') || "Todos"}</option>
              <option value="S">Tier S</option>
              <option value="A">Tier A</option>
              <option value="B">Tier B</option>
              <option value="C">Tier C</option>
              <option value="Skiller">Skiller</option>
              <option value="Trash">Trash</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('tblMetal') === 'Metal' ? 'Category:' : 'Categoria:'}</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 24px 8px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
                textTransform: 'capitalize'
              }}
            >
              <option value="all">{t('filterAll') || "Todas"}</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORY_NAMES[cat]?.[langKey] || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Rune Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Runa:</span>
            <select
              value={selectedRune}
              onChange={(e) => setSelectedRune(e.target.value)}
              style={{
                padding: '8px 24px 8px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
                textTransform: 'capitalize'
              }}
            >
              <option value="all">{t('filterAll') || "Todas"}</option>
              {uniqueRunes.map(rune => (
                <option key={rune} value={rune}>{rune}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Dynamic status line for filtering */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span>
            {t('filteringResults') || "Exibindo"} <strong>{sortedItems.length}</strong> {t('of') || "de"} <strong>{items.length}</strong> {t('statsItemPlural')}.
          </span>
          {(searchQuery || selectedTier !== 'all' || selectedCategory !== 'all' || selectedRune !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTier('all');
                setSelectedCategory('all');
                setSelectedRune('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              [ {t('clearFilters') || "Limpar Filtros"} ]
            </button>
          )}
        </div>
      </div>

      {/* Export Buttons */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={handleCopyMd}
          style={{
            background: mdCopied ? '#10b981' : 'var(--bg-panel)',
            border: `1px solid ${mdCopied ? '#10b981' : 'var(--border-color)'}`,
            color: mdCopied ? '#fff' : 'var(--text-primary)',
            padding: '6px 14px',
            fontSize: '0.78rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s',
            fontWeight: 600,
          }}
        >
          {mdCopied ? <CheckCircle size={13} /> : <FileText size={13} />}
          {mdCopied ? t('copied') : t('copyMarkdownBtn')}
        </button>

        <button
          onClick={handleCopyBb}
          style={{
            background: bbCopied ? '#10b981' : 'var(--bg-panel)',
            border: `1px solid ${bbCopied ? '#10b981' : 'var(--border-color)'}`,
            color: bbCopied ? '#fff' : 'var(--text-primary)',
            padding: '6px 14px',
            fontSize: '0.78rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s',
            fontWeight: 600,
          }}
        >
          {bbCopied ? <CheckCircle size={13} /> : <Layers size={13} />}
          {bbCopied ? t('copied') : t('copyBBCodeBtn')}
        </button>
      </div>

      {/* Item Table Grid */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-panel)' }}>
              {/* Interactive Sort Headers */}
              <th
                onClick={() => handleSort('tier')}
                style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '80px', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {t('tblHeaderTier')} {renderSortIndicator('tier')}
                </div>
              </th>
              
              <th
                onClick={() => handleSort('name')}
                style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {t('tblHeaderItem')} {renderSortIndicator('name')}
                </div>
              </th>
              
              <th
                onClick={() => handleSort('metal')}
                style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {t('tblMetal')} {renderSortIndicator('metal')}
                </div>
              </th>
              
              <th
                onClick={() => handleSort('ql')}
                style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {t('tblQL')} {renderSortIndicator('ql')}
                </div>
              </th>
              
              <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', userSelect: 'none' }}>
                {t('tblHeaderRunes')}
              </th>
              
              <th
                onClick={() => handleSort('score')}
                style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {t('tblHeaderScore')} {renderSortIndicator('score')}
                </div>
              </th>
              
              <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '120px' }}>
                {t('tblHeaderActions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {t('noItemsMatchingFilters') || "Nenhum item corresponde aos filtros aplicados."}
                </td>
              </tr>
            ) : (
              sortedItems.map(item => (
                <ItemRow key={item.id} item={item} t={t} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
