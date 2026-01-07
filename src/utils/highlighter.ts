import { codeToHtml, codeToTokens, type BundledTheme, type BundledLanguage } from 'shiki';
import { CODE_THEMES, type CodeThemeId } from '../types';

let highlighterReady = false;

export async function highlightCode(
  code: string,
  language: string,
  theme: CodeThemeId
): Promise<string> {
  try {
    const html = await codeToHtml(code, {
      lang: language as BundledLanguage,
      theme: theme as BundledTheme,
    });
    highlighterReady = true;
    return html;
  } catch (error) {
    console.error('Highlighting error:', error);
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

export interface TokenInfo {
  content: string;
  color: string;
}

export interface LineTokens {
  tokens: TokenInfo[];
}

export async function tokenizeCode(
  code: string,
  language: string,
  theme: CodeThemeId
): Promise<LineTokens[]> {
  try {
    const result = await codeToTokens(code, {
      lang: language as BundledLanguage,
      theme: theme as BundledTheme,
    });
    highlighterReady = true;
    return result.tokens.map(line => ({
      tokens: line.map(token => ({
        content: token.content,
        color: token.color || '#ffffff',
      })),
    }));
  } catch (error) {
    console.error('Tokenization error:', error);
    // Fallback: return plain text tokens
    return code.split('\n').map(line => ({
      tokens: [{ content: line, color: '#ffffff' }],
    }));
  }
}

export function getThemeBackground(themeId: CodeThemeId): string {
  const theme = CODE_THEMES.find(t => t.id === themeId);
  return theme?.bg || '#1e1e2e';
}

export function isLightTheme(themeId: CodeThemeId): boolean {
  const lightThemes = ['github-light', 'vitesse-light', 'catppuccin-latte', 'min-light', 'solarized-light'];
  return lightThemes.includes(themeId);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function isHighlighterReady(): boolean {
  return highlighterReady;
}

// Language detection based on common patterns
export function detectLanguage(code: string): string {
  // TypeScript/JavaScript patterns
  if (/^import\s+.*from\s+['"]|^export\s+(default\s+)?|const\s+\w+:\s*\w+/m.test(code)) {
    if (/:\s*(string|number|boolean|any|void|Promise|Array)\b/.test(code)) {
      return 'typescript';
    }
    return 'javascript';
  }
  
  // Kotlin patterns
  if (/^(fun|val|var|class|object|package|import)\s+/m.test(code) && 
      /:\s*\w+(\s*=|\s*\{|\s*\))/.test(code)) {
    return 'kotlin';
  }
  
  // Java patterns
  if (/^(public|private|protected)\s+(static\s+)?(class|void|int|String)/m.test(code)) {
    return 'java';
  }
  
  // Python patterns
  if (/^(def|class|import|from|if __name__|print\()/m.test(code) && !/[{};]/.test(code)) {
    return 'python';
  }
  
  // Rust patterns
  if (/^(fn|let|mut|impl|struct|enum|use|pub)\s+/m.test(code) && /->/.test(code)) {
    return 'rust';
  }
  
  // Go patterns
  if (/^(func|package|import|type|var|const)\s+/m.test(code) && /:=/.test(code)) {
    return 'go';
  }
  
  // HTML patterns
  if (/^<!DOCTYPE|<html|<head|<body|<div/m.test(code)) {
    return 'html';
  }
  
  // CSS patterns
  if (/^[.#\w\-[\]]+\s*\{[^}]*\}/m.test(code)) {
    return 'css';
  }
  
  // JSON patterns
  if (/^\s*[{[]/.test(code) && /[}\]]\s*$/.test(code)) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }
  
  // SQL patterns
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/im.test(code)) {
    return 'sql';
  }
  
  // Bash/Shell patterns
  if (/^#!\/bin\/(bash|sh)|^\$\s+|^echo\s+|^export\s+/m.test(code)) {
    return 'bash';
  }
  
  return 'javascript'; // Default
}
