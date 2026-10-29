import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Cleanly renders markdown text, stripping unwanted wrapping quotes and
 * rendering bold, lists, headings, and paragraphs with clean typography.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  // Strip wrapping outer quotes if the AI returned a JSON-quoted string
  let cleanContent = String(content).trim();
  if (
    (cleanContent.startsWith('"') && cleanContent.endsWith('"')) ||
    (cleanContent.startsWith("'") && cleanContent.endsWith("'"))
  ) {
    cleanContent = cleanContent.slice(1, -1).trim();
  }

  // Unescape escaped quotes e.g. \" to "
  cleanContent = cleanContent.replace(/\\"/g, '"').replace(/\\n/g, '\n');

  return (
    <div className={`prose prose-invert max-w-none text-xs leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-200">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-white text-cyan-300">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
          h1: ({ children }) => <h3 className="text-sm font-extrabold text-white mt-3 mb-1.5">{children}</h3>,
          h2: ({ children }) => <h3 className="text-sm font-extrabold text-white mt-3 mb-1.5">{children}</h3>,
          h3: ({ children }) => <h4 className="text-xs font-bold text-white mt-2 mb-1 text-indigo-300">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-500 pl-3 py-1 my-2 text-slate-400 italic bg-slate-900/40 rounded-r">
              {children}
            </blockquote>
          )
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}

