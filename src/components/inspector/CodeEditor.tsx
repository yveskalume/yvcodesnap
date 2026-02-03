import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { tokenizeCode, getThemeBackground, isLightTheme } from '../../utils/highlighter';
import type { CodeThemeId } from '../../types';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  language: string;
  theme: CodeThemeId;
  className?: string;
}

interface TokenInfo {
  content: string;
  color: string;
}

interface LineTokens {
  tokens: TokenInfo[];
}

const trimTrailingEmptyLines = (lines: LineTokens[]) => {
  const trimmed = [...lines];
  while (
    trimmed.length > 1 &&
    (trimmed[trimmed.length - 1].tokens.length === 0 ||
      trimmed[trimmed.length - 1].tokens.every((t) => t.content.trim() === ''))
  ) {
    trimmed.pop();
  }
  return trimmed;
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onBlur,
  language,
  theme,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<LineTokens[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [height, setHeight] = useState<number>(160);

  // Sync scroll between textarea and highlight overlay
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Tokenize code for syntax highlighting
  useEffect(() => {
    let cancelled = false;

    tokenizeCode(value, language, theme)
      .then((result) => {
        if (!cancelled) {
          setTokens(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value, language, theme]);

  // Auto-grow textarea & overlay height to content
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    const hl = highlightRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const next = Math.max(160, ta.scrollHeight);
    ta.style.height = `${next}px`;
    if (hl) {
      hl.style.height = `${next}px`;
    }
    setHeight(next);
  }, []);

  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();

      if (e.shiftKey) {
        // Shift+Tab: Remove indentation
        const beforeCursor = currentValue.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const linePrefix = currentValue.substring(lineStart, start);

        if (linePrefix.startsWith('  ')) {
          const newValue = currentValue.substring(0, lineStart) + currentValue.substring(lineStart + 2);
          onChange(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 2);
          }, 0);
        } else if (linePrefix.startsWith('\t')) {
          const newValue = currentValue.substring(0, lineStart) + currentValue.substring(lineStart + 1);
          onChange(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 1);
          }, 0);
        }
      } else {
        // Tab: Add indentation (2 spaces)
        const newValue = currentValue.substring(0, start) + '  ' + currentValue.substring(end);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
      return;
    }

    // Handle Enter for auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();

      const beforeCursor = currentValue.substring(0, start);
      const afterCursor = currentValue.substring(end);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = currentValue.substring(lineStart, start);
      const indentMatch = currentLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';

      const charBefore = currentValue[start - 1];
      const charAfter = currentValue[end];

      // Check if we're between matching brackets
      const isBetweenBrackets =
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '(' && charAfter === ')') ||
        (charBefore === '[' && charAfter === ']');

      if (isBetweenBrackets) {
        // Insert new line with extra indent, then closing bracket on same indent level
        const newValue =
          beforeCursor +
          '\n' +
          indent +
          '  ' +
          '\n' +
          indent +
          afterCursor;
        onChange(newValue);

        // Position cursor on the middle line with extra indentation
        const newCursorPos = start + 1 + indent.length + 2;
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
      } else {
        // Normal enter behavior with smart indentation
        const trimmedLine = currentLine.trim();
        const needsExtraIndent =
          trimmedLine.endsWith('{') ||
          trimmedLine.endsWith(':') ||
          trimmedLine.endsWith('(') ||
          trimmedLine.endsWith('[');
        const extraIndent = needsExtraIndent ? '  ' : '';

        const newValue = beforeCursor + '\n' + indent + extraIndent + afterCursor;
        onChange(newValue);

        const newCursorPos = start + 1 + indent.length + extraIndent.length;
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
      }
      return;
    }

    // Auto-close brackets
    const bracketPairs: Record<string, string> = {
      '{': '}',
      '(': ')',
      '[': ']',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (bracketPairs[e.key]) {
      const closingChar = bracketPairs[e.key];
      const charAfter = currentValue[end];

      // Don't auto-close if the next character is alphanumeric
      if (charAfter && /\w/.test(charAfter)) {
        return;
      }

      // For quotes, check if we're already inside a quote
      if (['"', "'", '`'].includes(e.key)) {
        // If next char is the same quote, just move cursor forward
        if (charAfter === e.key) {
          e.preventDefault();
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = end + 1;
          }, 0);
          return;
        }
      }

      e.preventDefault();
      const newValue =
        currentValue.substring(0, start) +
        e.key +
        closingChar +
        currentValue.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // Handle closing bracket - skip if same char is next
    const closingBrackets = ['}', ')', ']'];
    if (closingBrackets.includes(e.key)) {
      const charAfter = currentValue[end];
      if (charAfter === e.key) {
        e.preventDefault();
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = end + 1;
        }, 0);
        return;
      }
    }

    // Handle Backspace - delete matching bracket pair
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = currentValue[start - 1];
      const charAfter = currentValue[start];

      const pairMatch =
        (charBefore === '{' && charAfter === '}') ||
        (charBefore === '(' && charAfter === ')') ||
        (charBefore === '[' && charAfter === ']') ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'") ||
        (charBefore === '`' && charAfter === '`');

      if (pairMatch) {
        e.preventDefault();
        const newValue = currentValue.substring(0, start - 1) + currentValue.substring(end + 1);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
        }, 0);
        return;
      }
    }
  };

  const bgColor = getThemeBackground(theme);
  const isLight = isLightTheme(theme);
  const textColor = isLight ? '#1f2937' : '#e5e7eb';
  const caretColor = isLight ? '#000000' : '#ffffff';

  const displayLines = trimTrailingEmptyLines(
    tokens.length > 0
      ? tokens
      : value.split('\n').map((line) => ({
          tokens: [{ content: line, color: textColor }],
        }))
  );

  return (
    <div
      className={`relative font-mono text-sm rounded overflow-hidden border border-neutral-200 dark:border-white/10 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Syntax highlighted overlay */}
      <div
        ref={highlightRef}
        className="absolute inset-x-0 top-0 overflow-hidden pointer-events-none p-3 whitespace-pre"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          tabSize: 2,
          height,
        }}
        aria-hidden="true"
      >
        {isLoading ? (
          <span style={{ color: textColor, opacity: 0.5 }}>{value}</span>
        ) : (
          displayLines.map((line, lineIndex) => (
            <div key={lineIndex} style={{ minHeight: '1.5em' }}>
              {line.tokens.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                line.tokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} style={{ color: token.color }}>
                    {token.content}
                  </span>
                ))
              )}
            </div>
          ))
        )}
      </div>

      {/* Transparent textarea for input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onScroll={syncScroll}
        className="relative w-full bg-transparent resize-none p-3 outline-none overflow-hidden"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          tabSize: 2,
          color: 'transparent',
          caretColor: caretColor,
          WebkitTextFillColor: 'transparent',
          height,
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
};

export default CodeEditor;
