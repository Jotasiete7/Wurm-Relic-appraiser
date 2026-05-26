import type { WurmItem } from '../types';
import { ItemCard } from './ItemCard';

interface ItemGridProps {
  items: WurmItem[];
  t: (key: any) => string;
}

export function ItemGrid({ items, t }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No items parsed yet. Paste your logs above!
      </div>
    );
  }

  const normalItems = items.filter(i => !i.isSkiller).sort((a, b) => b.score - a.score);
  const skillerItems = items.filter(i => i.isSkiller).sort((a, b) => b.score - a.score);
  const sortedItems = [...normalItems, ...skillerItems];

  return (
    <div className="item-grid">
      {sortedItems.map(item => (
        <ItemCard key={`${item.normalizedName}_${item.ql}`} item={item} t={t} />
      ))}
    </div>
  );
}
