import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, rows = 6, className = '' }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(start);

    const needsNewline = start > 0 && !beforeText.endsWith('\n');
    const prefix = needsNewline ? '\n• ' : '• ';

    const newText = `${beforeText}${prefix}${afterText}`;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const beforeCursor = value.substring(0, start);
      const currentLine = beforeCursor.split('\n').pop() || '';

      if (currentLine.trim().startsWith('•')) {
        e.preventDefault();
        const afterCursor = value.substring(start);
        const newText = `${beforeCursor}\n• ${afterCursor}`;
        onChange(newText);

        setTimeout(() => {
          const newCursorPos = start + 3;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="bg-gray-50 border border-gray-300 rounded-t-md px-2 py-1 flex gap-1">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Negrito (Bold)"
        >
          <Bold size={18} className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Itálico (Italic)"
        >
          <Italic size={18} className="text-gray-700" />
        </button>
        <button
          type="button"
          onClick={insertBulletPoint}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Bullet Point"
        >
          <List size={18} className="text-gray-700" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowToolbar(true)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
      />
    </div>
  );
};
