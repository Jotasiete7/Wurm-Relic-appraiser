import { useState, useCallback } from 'react';
import type { WurmItem, ScreenshotItem, ExamineEntry } from './types';
import { ScreenshotInput } from './components/ScreenshotInput';
import { ExamineInput } from './components/ExamineInput';
import { ItemTable } from './components/ItemTable';
import { mergeInputs } from './parser/mergeInputs';
import { scoreAndTierItems } from './scoring/tierEngine';
import { HelpCircle, Play, RotateCcw, Info } from 'lucide-react';
import { Header } from './ecossistema-guilda/layout/Header';
import { useStats } from './hooks/useStats';
import { StatsCard } from './components/StatsCard';
import { useLanguage } from './hooks/useLanguage';
import { logAppraisalToDatabase } from './services/statsLogger';

type Step = 'input' | 'results';

export default function App() {
  const [step, setStep] = useState<Step>('input');
  const [ssItems, setSsItems] = useState<ScreenshotItem[]>([]);
  const [examineEntries, setExamineEntries] = useState<ExamineEntry[]>([]);
  const [items, setItems] = useState<WurmItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const { lang, changeLanguage, t } = useLanguage();

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
    setStep('results');
    recordAnalysisRun(scored);

    // Enviar dados estatísticos anonimizados em segundo plano para o Supabase (ou simulação local)
    logAppraisalToDatabase(scored, {
      hasScreenshot: ssItems.length > 0,
      hasExamine: examineEntries.length > 0,
      lang,
    });
  }, [ssItems, examineEntries, recordAnalysisRun, lang]);

  const handleReset = () => {
    setSsItems([]);
    setExamineEntries([]);
    setItems([]);
    setStep('input');
  };

  const canAnalyze = ssItems.length > 0 || examineEntries.length > 0;

  return (
    <>
      {/* Ecosystem Header */}
      <Header 
        currentToolId="chest"
        brandName="A Guilda"
        brandSubName="Relic Appraiser"
        lang={lang}
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

        {/* Header controls (moved from old header) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Language Selector Selector */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
            <button 
              onClick={() => changeLanguage('en')}
              style={{ 
                background: lang === 'en' ? 'var(--accent-primary)' : 'transparent',
                color: lang === 'en' ? '#000' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                gap: 0,
                transition: 'all 0.2s'
              }}
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('pt')}
              style={{ 
                background: lang === 'pt' ? 'var(--accent-primary)' : 'transparent',
                color: lang === 'pt' ? '#000' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                gap: 0,
                transition: 'all 0.2s'
              }}
            >
              PT
            </button>
          </div>

          {step === 'results' && (
            <button onClick={handleReset} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              <RotateCcw size={14} /> {t('newAnalysis')}
            </button>
          )}
          <button onClick={() => setShowHelp(h => !h)} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
            <HelpCircle size={14} /> {showHelp ? t('hideHelp') : t('help')}
          </button>
        </div>

        {/* Help panel */}
        {showHelp && (
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, fontSize: '1.1rem' }}>
              <Info size={20} color="var(--accent-primary)" /> {t('howToUse')}
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <p><strong>{t('helpP1')}</strong></p>
              <p><strong>{t('helpP2')}</strong></p>
              <p>{t('helpP3')}</p>
              <p>{t('helpP4')}</p>
              <p>{t('helpP5')}</p>
            </div>
          </div>
        )}

        {/* Input step */}
        {step === 'input' && (
          <div>
            {/* Two input columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Step 1 */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
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

              {/* Step 2 */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
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

        {/* Results step */}
        {step === 'results' && (
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

        {/* Persistent Statistics Dashboard */}
        <StatsCard stats={stats} onReset={resetStats} t={t} />
      </div>
    </>
  );
}
