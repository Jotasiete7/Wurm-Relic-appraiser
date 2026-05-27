import { useState, useCallback } from 'react';
import type { WurmItem, ScreenshotItem, ExamineEntry } from './types';
import { ScreenshotInput } from './components/ScreenshotInput';
import { ExamineInput } from './components/ExamineInput';
import { ItemTable } from './components/ItemTable';
import { mergeInputs } from './parser/mergeInputs';
import { scoreAndTierItems } from './scoring/tierEngine';
import { Play, RotateCcw, Sparkles, Layers, History } from 'lucide-react';
import { Header } from './ecossistema-guilda/layout/Header';
import { LayoutBase } from './ecossistema-guilda/layout/LayoutBase';
import { useStats } from './hooks/useStats';
import { StatsCard } from './components/StatsCard';
import { useLanguage } from './hooks/useLanguage';
import { logAppraisalToDatabase } from './services/statsLogger';
import { QuickGuide } from './components/QuickGuide';
import { useHistory } from './hooks/useHistory';
import type { SavedAppraisal } from './hooks/useHistory';
import { HistoryDashboard } from './components/HistoryDashboard';

type Tab = 'input' | 'results' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [ssItems, setSsItems] = useState<ScreenshotItem[]>([]);
  const [examineEntries, setExamineEntries] = useState<ExamineEntry[]>([]);
  const [items, setItems] = useState<WurmItem[]>([]);

  const { lang, changeLanguage, t } = useLanguage();
  const { history, saveAppraisal, deleteAppraisal, clearHistory } = useHistory();

  const {
    stats,
    incrementScreenshots,
    incrementExamineLogs,
    recordAnalysisRun,
    resetStats
  } = useStats();

  const handleAnalyze = useCallback(() => {
    if (ssItems.length === 0 && examineEntries.length === 0) return;
    const merged = mergeInputs(ssItems, examineEntries);
    const scored = scoreAndTierItems(merged);
    setItems(scored);
    
    // Auto-save to Local History
    const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
    const runName = `Análise de ${scored.length} itens (${dateStr} ${timeStr})`;
    saveAppraisal(runName, scored, ssItems.length > 0, examineEntries.length > 0);

    setActiveTab('results');
    recordAnalysisRun(scored);

    // Enviar dados estatísticos anonimizados em segundo plano para o Supabase (ou simulação local)
    logAppraisalToDatabase(scored, {
      hasScreenshot: ssItems.length > 0,
      hasExamine: examineEntries.length > 0,
      lang,
    });
  }, [ssItems, examineEntries, recordAnalysisRun, lang, saveAppraisal]);

  const handleReset = () => {
    setSsItems([]);
    setExamineEntries([]);
    setItems([]);
    setActiveTab('input');
  };

  const handleLoadAppraisal = useCallback((saved: SavedAppraisal) => {
    setItems(saved.items);
    // Clear current input states to signify we are viewing restored history items
    setSsItems([]);
    setExamineEntries([]);
    setActiveTab('results');
  }, []);

  const canAnalyze = ssItems.length > 0 || examineEntries.length > 0;

  return (
    <LayoutBase>
      {/* Ecosystem Header */}
      <Header 
        currentToolId="chest"
        brandName="A Guilda"
        brandSubName="Relic Appraiser"
        lang={lang}
        onLanguageChange={changeLanguage}
      />

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Beta Notice Banner */}
        <div style={{
          background: 'rgba(212, 180, 131, 0.06)',
          border: '1px dashed var(--accent-primary)',
          color: 'var(--accent-primary)',
          borderRadius: '8px',
          padding: '0.75rem 1.25rem',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          lineHeight: 1.4
        }}>
          {t('betaNotice')}
        </div>

        {/* ── TABS NAVIGATION ────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem',
          gap: '1.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => setActiveTab('input')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'input' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'input' ? 'var(--accent-primary)' : 'var(--text-muted)',
              padding: '0.75rem 0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              borderRadius: 0
            }}
          >
            <Sparkles size={15} /> {t('newAnalysisTab') || "Nova Análise"}
          </button>
          
          <button
            onClick={() => items.length > 0 && setActiveTab('results')}
            disabled={items.length === 0}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'results' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: items.length === 0 
                ? 'rgba(255,255,255,0.1)' 
                : activeTab === 'results' ? 'var(--accent-primary)' : 'var(--text-muted)',
              padding: '0.75rem 0.5rem',
              cursor: items.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              borderRadius: 0
            }}
          >
            <Layers size={15} /> 
            {t('resultsTab') || "Resultados"}
            {items.length > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(212,180,131,0.15)', color: 'var(--accent-primary)', padding: '1px 6px', borderRadius: '10px' }}>
                {items.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-muted)',
              padding: '0.75rem 0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              borderRadius: 0
            }}
          >
            <History size={15} /> {t('historyTab') || "Histórico"}
            {history.length > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', padding: '1px 6px', borderRadius: '10px' }}>
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Action bar (results only) */}
        {activeTab === 'results' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button onClick={handleReset} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              <RotateCcw size={14} /> {t('newAnalysis')}
            </button>
          </div>
        )}

        {/* ── TAB 1: INPUT STEP ──────────────────────────────────────────── */}
        {activeTab === 'input' && (
          <div>
            <QuickGuide t={t} />

            {/* Two input columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              
              {/* Step 1 Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: ssItems.length > 0 ? '#10b981' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('step1Title')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('step1Subtitle')}</div>
                  </div>
                  {ssItems.length > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      ✓ {ssItems.length} {t('step1Items')}
                    </span>
                  )}
                </div>
                <ScreenshotInput 
                  onItemsReady={setSsItems} 
                  onScreenshotProcessed={incrementScreenshots}
                  t={t}
                />
              </div>

              {/* Step 2 Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: examineEntries.length > 0 ? '#10b981' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('step2Title')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('step2Subtitle')}</div>
                  </div>
                  {examineEntries.length > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      ✓ {examineEntries.length} {t('step2Entries')}
                    </span>
                  )}
                </div>
                <ExamineInput 
                  onEntriesReady={setExamineEntries} 
                  onExamineLogProcessed={incrementExamineLogs}
                  t={t}
                />
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 700,
                background: canAnalyze
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : 'var(--bg-panel)',
                color: canAnalyze ? '#fff' : 'var(--text-muted)',
                border: canAnalyze ? 'none' : '1px solid var(--border-color)',
                cursor: canAnalyze ? 'pointer' : 'not-allowed',
                opacity: canAnalyze ? 1 : 0.6,
              }}
            >
              <Play size={18} /> {t('analyzeBtn')}
            </button>
            {!canAnalyze && (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {t('fillNotice')}
              </p>
            )}
          </div>
        )}

        {/* ── TAB 2: RESULTS STEP ────────────────────────────────────────── */}
        {activeTab === 'results' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>
                {t('results')}
                <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '2px 10px', borderRadius: '999px', fontWeight: 400 }}>
                  {items.length} {items.length === 1 ? t('statsItemSingular') : t('statsItemPlural')}
                </span>
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                <span>S: {items.filter(i => i.tier === 'S').length}</span>
                <span>A: {items.filter(i => i.tier === 'A').length}</span>
                <span>B: {items.filter(i => i.tier === 'B').length}</span>
                <span>C: {items.filter(i => i.tier === 'C').length}</span>
                <span>Trash: {items.filter(i => i.tier === 'Trash').length}</span>
                {items.filter(i => i.isSkiller).length > 0 && (
                  <span>Skiller: {items.filter(i => i.isSkiller).length}</span>
                )}
              </div>
            </div>
            <ItemTable items={items} t={t} />
          </div>
        )}

        {/* ── TAB 3: APPRAISAL HISTORY STEP ──────────────────────────────── */}
        {activeTab === 'history' && (
          <HistoryDashboard
            history={history}
            onLoadAppraisal={handleLoadAppraisal}
            onDeleteAppraisal={deleteAppraisal}
            onClearHistory={clearHistory}
            t={t}
          />
        )}

        {/* Persistent Statistics Dashboard */}
        <StatsCard stats={stats} onReset={resetStats} t={t} />
      </div>
    </LayoutBase>
  );
}
