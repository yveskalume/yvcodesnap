import { codeToHtml } from 'shiki';

let highlighterReady = false;

export async function highlightCode(
  code: string,
  language: string,
  theme: 'dark' | 'light'
): Promise<string> {
  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme: theme === 'dark' ? 'github-dark' : 'github-light',
    });
    highlighterReady = true;
    return html;
  } catch (error) {
    console.error('Highlighting error:', error);
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
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
