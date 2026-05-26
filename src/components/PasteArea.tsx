import { useState } from 'react';

interface PasteAreaProps {
  onLogsParsed: (text: string) => void;
}

export function PasteArea({ onLogsParsed }: PasteAreaProps) {
  const [text, setText] = useState('');

  const handleParse = () => {
    onLogsParsed(text);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Examine Logs</h2>
      <textarea
        rows={8}
        placeholder="Paste your Wurm Online examine logs here (e.g. [14:22] You see a rare iron hammer. Ql: 90...)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button 
        onClick={handleParse} 
        style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', width: '100%', justifyContent: 'center', fontSize: '1.1rem' }}
      >
        Parse Logs
      </button>
    </div>
  );
}
