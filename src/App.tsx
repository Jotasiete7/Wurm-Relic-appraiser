import React, { useState, useCallback } from 'react';
import type { WurmItem, ScreenshotItem, ExamineEntry } from './types';
import { ScreenshotInput } from './components/ScreenshotInput';
import { ExamineInput } from './components/ExamineInput';
import { ItemTable } from './components/ItemTable';
import { mergeInputs } from './parser/mergeInputs';
import { scoreAndTierItems } from './scoring/tierEngine';
import { HelpCircle, ChevronDown, ChevronUp, Play, RotateCcw, Info } from 'lucide-react';
import { Header } from './ecossistema-guilda/layout/Header';
import agStyles from './ecossistema-guilda/layout/Header.module.css';

type Step = 'input' | 'results';

export default function App() {
  const [step, setStep] = useState<Step>('input');
  const [ssItems, setSsItems] = useState<ScreenshotItem[]>([]);
  const [examineEntries, setExamineEntries] = useState<ExamineEntry[]>([]);
  const [items, setItems] = useState<WurmItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (ssItems.length === 0 && examineEntries.length === 0) return;
    const merged = mergeInputs(ssItems, examineEntries);
    const scored = scoreAndTierItems(merged);
    setItems(scored);
    setStep('results');
  }, [ssItems, examineEntries]);

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
      />

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Header controls (moved from old header) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem', gap: '8px' }}>
        {step === 'results' && (
          <button onClick={handleReset} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
            <RotateCcw size={15} /> New Analysis
          </button>
        )}
        <button onClick={() => setShowHelp(h => !h)} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
          <HelpCircle size={15} /> {showHelp ? 'Hide Help' : 'Help'}
        </button>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, fontSize: '1.1rem' }}>
            <Info size={20} color="var(--accent-primary)" /> How to Use
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <p><strong>Step 1 (optional) — Chest screenshot:</strong> Paste the text from your chest/inventory window, or upload a screenshot. This gives the app item names, metals, and QL values.</p>
            <p><strong>Step 2 (optional) — Examine log:</strong> Examine all items in Wurm, then copy the Event tab log here. This gives the app runes and enchantments.</p>
            <p><strong>Best results</strong> come from using <em>both</em> inputs together — the app merges them automatically by item name.</p>
            <p><strong>Scoring:</strong> Usage Speed is the most valuable rune effect for tools. Multiple runes stack. Moonmetal items get +15 pts bonus. Rare+ items also get a rarity bonus.</p>
            <p><strong>Rename:</strong> Use "Copy Rename" to copy a tag like <code>[S] stone chisel iron ql87</code> to your clipboard for in-game renaming.</p>
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
                  <div style={{ fontWeight: 600 }}>Chest / Inventory Window</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gives name, metal, QL, rarity</div>
                </div>
                {ssItems.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                    ✓ {ssItems.length} items
                  </span>
                )}
              </div>
              <ScreenshotInput onItemsReady={setSsItems} />
            </div>

            {/* Step 2 */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: examineEntries.length > 0 ? '#10b981' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Examine Log</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gives runes & enchantments</div>
                </div>
                {examineEntries.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                    ✓ {examineEntries.length} entries
                  </span>
                )}
              </div>
              <ExamineInput onEntriesReady={setExamineEntries} />
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
            <Play size={18} /> Analyze & Score Items
          </button>
          {!canAnalyze && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Fill in at least one input above to continue
            </p>
          )}
        </div>
      )}

      {/* Results step */}
      {step === 'results' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ margin: 0 }}>
              Results
              <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '2px 10px', borderRadius: '999px', fontWeight: 400 }}>
                {items.length} items
              </span>
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
              <span>S: {items.filter(i => i.tier === 'S').length}</span>
              <span>A: {items.filter(i => i.tier === 'A').length}</span>
              <span>B: {items.filter(i => i.tier === 'B').length}</span>
              <span>C: {items.filter(i => i.tier === 'C').length}</span>
              <span>Trash: {items.filter(i => i.tier === 'Trash').length}</span>
            </div>
          </div>
          <ItemTable items={items} />
        </div>
      )}
    </div>
    </>
  );
}
