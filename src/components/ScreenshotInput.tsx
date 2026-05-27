import { useState, useCallback, useEffect } from 'react';
import type { ScreenshotItem } from '../types';
import { parseScreenshotImage } from '../parser/screenshotParser';
import { preprocessImage } from '../utils/imagePreprocess';
import { Upload, Loader, CheckCircle } from 'lucide-react';

interface ScreenshotInputProps {
  onItemsReady: (items: ScreenshotItem[]) => void;
  onScreenshotProcessed?: () => void;
  t: (key: any) => string;
}

export function ScreenshotInput({ 
  onItemsReady,
  onScreenshotProcessed,
  t
}: ScreenshotInputProps) {
  const [parsedItems, setParsedItems] = useState<ScreenshotItem[]>([]);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [ocrRaw, setOcrRaw] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const runOcr = useCallback(async (file: File) => {
    setIsEnhancing(true);
    setOcrProgress(0);
    try {
      // 1. Run Canvas-level scaling & contrast pre-processing
      const enhancedFile = await preprocessImage(file);
      setIsEnhancing(false);
      
      // 2. Perform OCR text recognition
      const { items, rawOcrText } = await parseScreenshotImage(enhancedFile, setOcrProgress);
      setOcrRaw(rawOcrText);
      setParsedItems(items);
      onItemsReady(items);
      if (items.length > 0) {
        onScreenshotProcessed?.();
      }
    } catch (err) {
      console.error('[OCR Error] Failed to process screenshot:', err);
    } finally {
      setIsEnhancing(false);
      setOcrProgress(null);
    }
  }, [onItemsReady, onScreenshotProcessed]);

  // Global paste handler for Ctrl+V
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            runOcr(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [runOcr]);

  // Prevent default browser behavior for drag & drop globally to avoid opening dropped files
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Check for files dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      runOcr(e.dataTransfer.files[0]);
      return;
    }

    // Fallback checking for items
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          if (file) {
            runOcr(file);
            break;
          }
        }
      }
    }
  }, [runOcr]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runOcr(file);
  };

  return (
    <div>
      {/* Image OCR input */}
      <div>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {t('uploadScreenshotInstruction')}
        </p>
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            borderRadius: '8px',
            padding: '2.5rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            background: isDragging ? 'rgba(212,180,131,0.08)' : 'var(--bg-panel)',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('ocr-file-input')?.click()}
        >
          {/* pointerEvents: 'none' solves drag flickering and drop failure when hovering children */}
          <div style={{ pointerEvents: 'none' }}>
            {ocrProgress !== null || isEnhancing ? (
              <div>
                <Loader size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '0.5rem' }}>
                  {isEnhancing ? t('enhancingImage') : `${t('runningOcr')} ${ocrProgress}%`}
                </div>
              </div>
            ) : (
              <div>
                <Upload size={32} style={{ marginBottom: '0.5rem', color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                <div>{t('dropZoneText')}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{t('acceptedFormats')}</div>
              </div>
            )}
          </div>
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
            <summary style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>{t('viewRawOcr')}</summary>
            <textarea rows={5} value={ocrRaw} readOnly style={{ marginTop: '0.5rem', fontSize: '0.75rem' }} />
          </details>
        )}
      </div>

      {/* Preview table */}
      {parsedItems.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: '#10b981' }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{parsedItems.length} {t('itemsExtracted')}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>{t('tblName')}</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>{t('tblMetal')}</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>{t('tblRarity')}</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>{t('tblQL')}</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>{t('tblDam')}</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>{t('tblNote')}</th>
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
