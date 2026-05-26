import React, { useState, useCallback } from 'react';
import type { ScreenshotItem } from '../types';
import { parseScreenshotText, parseScreenshotImage } from '../parser/screenshotParser';
import { Upload, ClipboardList, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

interface ScreenshotInputProps {
  onItemsReady: (items: ScreenshotItem[]) => void;
}

type Tab = 'image' | 'text';

export function ScreenshotInput({ onItemsReady }: ScreenshotInputProps) {
  const [tab, setTab] = useState<Tab>('text');
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ScreenshotItem[]>([]);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [ocrRaw, setOcrRaw] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleText = useCallback(() => {
    const items = parseScreenshotText(rawText);
    setParsedItems(items);
    onItemsReady(items);
  }, [rawText, onItemsReady]);

  const runOcr = useCallback(async (file: File) => {
    setOcrProgress(0);
    try {
      const { items, rawOcrText } = await parseScreenshotImage(file, setOcrProgress);
      setOcrRaw(rawOcrText);
      setParsedItems(items);
      onItemsReady(items);
    } finally {
      setOcrProgress(null);
    }
  }, [onItemsReady]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runOcr(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runOcr(file);
  }, [runOcr]);

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.25rem',
    background: active ? 'var(--accent-primary)' : 'var(--bg-panel)',
    color: active ? '#fff' : 'var(--text-secondary)',
    border: '1px solid ' + (active ? 'var(--accent-primary)' : 'var(--border-color)'),
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
  });

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <button style={TAB_STYLE(tab === 'text')}  onClick={() => setTab('text')}>
          <ClipboardList size={15} /> Paste Text
        </button>
        <button style={TAB_STYLE(tab === 'image')} onClick={() => setTab('image')}>
          <Upload size={15} /> Upload Screenshot
        </button>
      </div>

      {/* Plain text input */}
      {tab === 'text' && (
        <div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            In Wurm, open the chest/inventory window, select all (<kbd>Ctrl+A</kbd>) and copy (<kbd>Ctrl+C</kbd>) the item list, then paste it below.
          </p>
          <textarea
            rows={6}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder={'rare stone chisel, iron    87,00  0,00  0,30  ...\ntrowel, glimmersteel (2x spd)   74,00  2,10  0,10  ...'}
          />
          <button onClick={handleText} style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>
            Parse Inventory List
          </button>
        </div>
      )}

      {/* Image OCR input */}
      {tab === 'image' && (
        <div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Take a screenshot of the chest/inventory window and upload it. OCR will extract item names, metals, and QL values.
          </p>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              padding: '2.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              background: isDragging ? 'rgba(59,130,246,0.05)' : 'var(--bg-panel)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('ocr-file-input')?.click()}
          >
            {ocrProgress !== null ? (
              <div>
                <Loader size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '0.5rem' }}>Running OCR… {ocrProgress}%</div>
              </div>
            ) : (
              <div>
                <Upload size={32} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                <div>Drop image here or click to upload</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>.png, .jpg, .bmp accepted</div>
              </div>
            )}
          </div>
          <input
            id="ocr-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          {ocrRaw && (
            <details style={{ marginTop: '0.75rem' }}>
              <summary style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>View raw OCR output</summary>
              <textarea rows={5} value={ocrRaw} readOnly style={{ marginTop: '0.5rem', fontSize: '0.75rem' }} />
            </details>
          )}
        </div>
      )}

      {/* Preview table */}
      {parsedItems.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#10b981' }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{parsedItems.length} items extracted</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Metal</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Rarity</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>QL</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>Dam</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '4px 8px', textTransform: 'capitalize' }}>{item.normalizedName}</td>
                    <td style={{ padding: '4px 8px', textTransform: 'capitalize' }}>{item.metal ?? '—'}</td>
                    <td style={{ padding: '4px 8px', textTransform: 'capitalize' }}>{item.rarity}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{item.ql.toFixed(2)}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{item.damage.toFixed(2)}</td>
                    <td style={{ padding: '4px 8px', color: 'var(--text-muted)' }}>{item.playerNote ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
