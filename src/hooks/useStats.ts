import { useMemo, useCallback } from 'react';
import type { SavedAppraisal } from './useHistory';

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

export function useStats(history: SavedAppraisal[]) {
  const stats = useMemo<WurmStats>(() => {
    const tierCounts = {
      S: 0,
      A: 0,
      B: 0,
      C: 0,
      Trash: 0,
      Skiller: 0
    };
    let totalItems = 0;
    let screenshotsProcessed = 0;
    let examineLogsProcessed = 0;

    for (const appraisal of history) {
      if (appraisal.hasScreenshot) screenshotsProcessed++;
      if (appraisal.hasExamine) examineLogsProcessed++;
      totalItems += appraisal.items.length;
      for (const item of appraisal.items) {
        const tier = item.tier;
        if (tier in tierCounts) {
          tierCounts[tier as keyof typeof tierCounts]++;
        }
      }
    }

    return {
      totalRuns: history.length,
      screenshotsProcessed,
      examineLogsProcessed,
      tierCounts,
      totalItems
    };
  }, [history]);

  // Keep these as no-ops to maintain hook compatibility and prevent compilation errors
  const incrementScreenshots = useCallback(() => {}, []);
  const incrementExamineLogs = useCallback(() => {}, []);
  const recordAnalysisRun = useCallback(() => {}, []);
  const resetStats = useCallback(() => {}, []);

  return {
    stats,
    incrementScreenshots,
    incrementExamineLogs,
    recordAnalysisRun,
    resetStats
  };
}
