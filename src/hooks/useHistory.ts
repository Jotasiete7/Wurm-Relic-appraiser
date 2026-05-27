import { useState, useCallback } from 'react';
import type { WurmItem } from '../types';

export interface SavedAppraisal {
  id: string;
  timestamp: number;
  name: string;
  items: WurmItem[];
  hasScreenshot: boolean;
  hasExamine: boolean;
}

const STORAGE_KEY = 'wurm_appraiser_history';
const MAX_HISTORY_ITEMS = 20;

export function useHistory() {
  const [history, setHistory] = useState<SavedAppraisal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('[History] Failed to load history from localStorage', e);
    }
    return [];
  });

  const saveAppraisal = useCallback((name: string, items: WurmItem[], hasScreenshot: boolean, hasExamine: boolean) => {
    if (items.length === 0) return;

    setHistory(prev => {
      const newAppraisal: SavedAppraisal = {
        id: `appraisal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: Date.now(),
        name: name.trim() || `Análise #${prev.length + 1}`,
        items,
        hasScreenshot,
        hasExamine,
      };

      // Keep only up to the maximum number of items (newest first)
      const updated = [newAppraisal, ...prev].slice(0, MAX_HISTORY_ITEMS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('[History] Failed to write history to localStorage', e);
      }
      return updated;
    });
  }, []);

  const deleteAppraisal = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('[History] Failed to write history to localStorage', e);
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[History] Failed to clear history from localStorage', e);
    }
  }, []);

  return {
    history,
    saveAppraisal,
    deleteAppraisal,
    clearHistory
  };
}
