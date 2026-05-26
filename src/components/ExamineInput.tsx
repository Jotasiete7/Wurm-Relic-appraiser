import React, { useState } from 'react';
import type { ExamineEntry } from '../types';
import { parseExamineLog } from '../parser/examineParser';
import { FileText, CheckCircle } from 'lucide-react';

interface ExamineInputProps {
  onEntriesReady: (entries: ExamineEntry[]) => void;
}

export function ExamineInput({ onEntriesReady }: ExamineInputProps) {
  const [text, setText] = useState('');
  const [count, setCount] = useState<number | null>(null);

  const handleParse = () => {
    const entries = parseExamineLog(text);
    setCount(entries.length);
    onEntriesReady(entries);
  };

  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        In Wurm, examine all items in the chest. Copy the entire <strong>Event</strong> tab log and paste it below.
      </p>
      <textarea
        rows={8}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'[17:03:47] A straight tool with a strong hard blade made for cutting stone...\n[17:03:47] A lead rune of Fo has been attached, so it will...'}
      />
      <button onClick={handleParse} style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>
        <FileText size={15} /> Parse Examine Log
      </button>
      {count !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.75rem', color: '#10b981', fontSize: '0.875rem' }}>
          <CheckCircle size={16} />
          <span>{count} examine entries parsed</span>
        </div>
      )}
    </div>
  );
}
