import { useState } from 'react';
import type { ExamineEntry } from '../types';
import { parseExamineLog } from '../parser/examineParser';
import { FileText, CheckCircle, Zap } from 'lucide-react';

interface ExamineInputProps {
  onEntriesReady: (entries: ExamineEntry[]) => void;
  onExamineLogProcessed?: () => void;
  t: (key: any) => string;
}

export function ExamineInput({ onEntriesReady, onExamineLogProcessed, t }: ExamineInputProps) {
  const [text, setText] = useState('');
  const [count, setCount] = useState<number | null>(null);

  const hasText = text.trim().length > 0;
  const isParsed = count !== null;

  const handleParse = () => {
    const entries = parseExamineLog(text);
    setCount(entries.length);
    onEntriesReady(entries);
    if (entries.length > 0) {
      onExamineLogProcessed?.();
    }
  };

  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {t('examineInstruction')}
      </p>
      <textarea
        rows={8}
        value={text}
        onChange={e => { setText(e.target.value); setCount(null); }}
        placeholder={'[17:03:47] A straight tool with a strong hard blade made for cutting stone...\n[17:03:47] A lead rune of Fo has been attached, so it will...'}
      />

      {/* Parse button: visually prominent when text is present */}
      <button
        onClick={handleParse}
        disabled={!hasText}
        style={{
          marginTop: '0.75rem',
          width: '100%',
          justifyContent: 'center',
          padding: '0.75rem 1rem',
          fontWeight: 700,
          fontSize: '0.95rem',
          border: 'none',
          borderRadius: '8px',
          cursor: hasText ? 'pointer' : 'not-allowed',
          opacity: hasText ? 1 : 0.4,
          transition: 'all 0.25s ease',
          background: hasText
            ? isParsed
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #d4b483, #b8954f)'
            : 'var(--bg-panel)',
          color: hasText ? '#fff' : 'var(--text-muted)',
          boxShadow: hasText && !isParsed
            ? '0 0 0 2px rgba(212, 180, 131, 0.35), 0 4px 14px rgba(212, 180, 131, 0.2)'
            : 'none',
          animation: hasText && !isParsed ? 'pulse-btn 2s ease-in-out infinite' : 'none',
        }}
      >
        <style>{`
          @keyframes pulse-btn {
            0%, 100% { box-shadow: 0 0 0 2px rgba(212,180,131,0.35), 0 4px 14px rgba(212,180,131,0.2); }
            50%       { box-shadow: 0 0 0 5px rgba(212,180,131,0.15), 0 4px 22px rgba(212,180,131,0.35); }
          }
        `}</style>
        {isParsed
          ? <><CheckCircle size={15} /> {t('parseExamineLogBtn')}</>
          : hasText
            ? <><Zap size={15} /> {t('parseExamineLogBtn')}</>
            : <><FileText size={15} /> {t('parseExamineLogBtn')}</>
        }
      </button>

      {count !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', color: '#10b981', fontSize: '0.875rem' }}>
          <CheckCircle size={16} />
          <span>{count} {t('examineEntriesParsed')}</span>
        </div>
      )}
    </div>
  );
}

