import { Copy, Check } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
  const { copied, copy } = useClipboard();

  return (
    <div className="relative group">
      <button
        onClick={() => copy(code)}
        className="absolute top-3 right-3 p-2 bg-courtroom-800 hover:bg-courtroom-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-verdict-success" />
        ) : (
          <Copy className="w-4 h-4 text-courtroom-300" />
        )}
      </button>
      <pre className="bg-courtroom-900 border border-courtroom-700 rounded-lg p-4 overflow-x-auto">
        <code className={`language-${language} text-sm text-courtroom-200`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
