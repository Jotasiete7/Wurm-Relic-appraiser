import React from 'react';
import type { WurmItem } from '../types';
import { ItemCard } from './ItemCard';

interface ItemGridProps {
  items: WurmItem[];
}

export function ItemGrid({ items }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No items parsed yet. Paste your logs above!
      </div>
    );
  }

  // Sort items by score descending
  const sortedItems = [...items].sort((a, b) => b.score - a.score);

  return (
    <div className="item-grid">
      {sortedItems.map(item => (
        <ItemCard key={`${item.normalizedName}_${item.ql}`} item={item} />
      ))}
    </div>
  );
}
