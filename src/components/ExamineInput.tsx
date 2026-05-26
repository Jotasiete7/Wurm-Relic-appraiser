import { useState } from 'react';
import type { ExamineEntry } from '../types';
import { parseExamineLog } from '../parser/examineParser';
import { FileText, CheckCircle } from 'lucide-react';

interface ExamineInputProps {
  onEntriesReady: (entries: ExamineEntry[]) => void;
  onExamineLogProcessed?: () => void;
  t: (key: any) => string;
}

export function ExamineInput({ onEntriesReady, onExamineLogProcessed, t }: ExamineInputProps) {
  const [text, setText] = useState('');
  const [count, setCount] = useState<number | null>(null);

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
        onChange={e => setText(e.target.value)}
        placeholder={'[17:03:47] A straight tool with a strong hard blade made for cutting stone...\n[17:03:47] A lead rune of Fo has been attached, so it will...'}
      />
      <button onClick={handleParse} style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>
        <FileText size={15} /> {t('parseExamineLogBtn')}
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
