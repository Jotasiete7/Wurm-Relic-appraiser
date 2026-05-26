import { useState, useCallback } from 'react';
import type { WurmItem } from '../types';

export interface WurmStats {
  totalRuns: number;
  screenshotsProcessed: number;
  examineLogsProcessed: number;
  tierCounts: {
    S: number;
    A: number;
    B: number;
    C: number;
    Trash: number;
    Skiller: number;
  };
  totalItems: number;
}

const DEFAULT_STATS: WurmStats = {
  totalRuns: 0,
  screenshotsProcessed: 0,
  examineLogsProcessed: 0,
  tierCounts: {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    Trash: 0,
    Skiller: 0
  },
  totalItems: 0
};

const STORAGE_KEY = 'wurm_appraiser_stats';

export function useStats() {
  const [stats, setStats] = useState<WurmStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_STATS,
          ...parsed,
          tierCounts: {
            ...DEFAULT_STATS.tierCounts,
            ...(parsed.tierCounts || {})
          }
        };
      }
    } catch (e) {
      console.error("Failed to load stats from localStorage", e);
    }
    return DEFAULT_STATS;
  });

  const saveStats = useCallback((updateFn: (prev: WurmStats) => WurmStats) => {
    setStats(prev => {
      const next = updateFn(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save stats to localStorage", e);
      }
      return next;
    });
  }, []);

  const incrementScreenshots = useCallback(() => {
    saveStats(prev => ({
      ...prev,
      screenshotsProcessed: prev.screenshotsProcessed + 1
    }));
  }, [saveStats]);

  const incrementExamineLogs = useCallback(() => {
    saveStats(prev => ({
      ...prev,
      examineLogsProcessed: prev.examineLogsProcessed + 1
    }));
  }, [saveStats]);

  const recordAnalysisRun = useCallback((items: WurmItem[]) => {
    saveStats(prev => {
      const newTierCounts = { ...prev.tierCounts };
      for (const item of items) {
        const tier = item.tier;
        if (tier in newTierCounts) {
          newTierCounts[tier as keyof typeof newTierCounts] = (newTierCounts[tier as keyof typeof newTierCounts] || 0) + 1;
        }
      }
      return {
        ...prev,
        totalRuns: prev.totalRuns + 1,
        totalItems: prev.totalItems + items.length,
        tierCounts: newTierCounts
      };
    });
  }, [saveStats]);

  const resetStats = useCallback(() => {
    saveStats(() => DEFAULT_STATS);
  }, [saveStats]);

  return {
    stats,
    incrementScreenshots,
    incrementExamineLogs,
    recordAnalysisRun,
    resetStats
  };
}
