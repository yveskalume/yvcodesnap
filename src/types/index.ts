export type BackgroundType = 'solid' | 'gradient';

export interface SolidBackground {
  color: string;
}

export interface GradientBackground {
  from: string;
  to: string;
  angle: number;
}

export interface Background {
  type: BackgroundType;
  solid: SolidBackground;
  gradient: GradientBackground;
}

export interface Shadow {
  blur: number;
  spread: number;
  color: string;
}

export interface LineHighlight {
  from: number;
  to: number;
  style: 'focus' | 'added' | 'removed';
}

export interface CodeBlockProps {
  code: string;
  language: string;
  theme: CodeThemeId;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  lineNumbers: boolean;
  highlights: LineHighlight[];
  padding: number;
  cornerRadius: number;
  shadow: Shadow;
}

export interface TextProps {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
  background: { color: string } | null;
  padding: number;
  cornerRadius: number;
}

export interface ArrowProps {
  style: 'straight' | 'curved';
  color: string;
  thickness: number;
  head: 'filled' | 'outline' | 'none';
}

export type ElementType = 'code' | 'text' | 'arrow';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
}

export interface CodeElement extends BaseElement {
  type: 'code';
  width: number;
  height: number;
  props: CodeBlockProps;
}

export interface TextElement extends BaseElement {
  type: 'text';
  props: TextProps;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  points: { x: number; y: number }[];
  props: ArrowProps;
}

export type CanvasElement = CodeElement | TextElement | ArrowElement;

export interface AspectRatio {
  name: string;
  width: number;
  height: number;
}

export interface CanvasMeta {
  title: string;
  aspect: string;
  width: number;
  height: number;
}

export interface Snap {
  version: string;
  meta: CanvasMeta;
  background: Background;
  elements: CanvasElement[];
}

export const ASPECT_RATIOS: AspectRatio[] = [
  { name: 'Square (1:1)', width: 1080, height: 1080 },
  { name: '16:9 (1920x1080)', width: 1920, height: 1080 },
  { name: '16:9 (1600x900)', width: 1600, height: 900 },
  { name: 'LinkedIn', width: 1200, height: 627 },
  { name: 'Portrait', width: 1080, height: 1350 },
  { name: 'Story', width: 1080, height: 1920 },
];

export const CODE_THEMES = [
  { id: 'github-dark', name: 'GitHub Dark', bg: '#0d1117' },
  { id: 'github-light', name: 'GitHub Light', bg: '#ffffff' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36' },
  { id: 'nord', name: 'Nord', bg: '#2e3440' },
  { id: 'one-dark-pro', name: 'One Dark Pro', bg: '#282c34' },
  { id: 'monokai', name: 'Monokai', bg: '#272822' },
  { id: 'tokyo-night', name: 'Tokyo Night', bg: '#1a1b26' },
  { id: 'vitesse-dark', name: 'Vitesse Dark', bg: '#121212' },
  { id: 'vitesse-light', name: 'Vitesse Light', bg: '#ffffff' },
  { id: 'material-theme-darker', name: 'Material Darker', bg: '#212121' },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', bg: '#1e1e2e' },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', bg: '#eff1f5' },
  { id: 'slack-dark', name: 'Slack Dark', bg: '#222222' },
  { id: 'poimandres', name: 'Poimandres', bg: '#1b1e28' },
  { id: 'night-owl', name: 'Night Owl', bg: '#011627' },
  { id: 'min-dark', name: 'Min Dark', bg: '#1f1f1f' },
  { id: 'min-light', name: 'Min Light', bg: '#ffffff' },
  { id: 'ayu-dark', name: 'Ayu Dark', bg: '#0b0e14' },
  { id: 'solarized-dark', name: 'Solarized Dark', bg: '#002b36' },
  { id: 'solarized-light', name: 'Solarized Light', bg: '#fdf6e3' },
] as const;

export type CodeThemeId = typeof CODE_THEMES[number]['id'];

export const LANGUAGES = [
  'javascript',
  'typescript',
  'kotlin',
  'java',
  'python',
  'rust',
  'go',
  'html',
  'css',
  'json',
  'markdown',
  'bash',
  'sql',
] as const;

export const FONT_FAMILIES = {
  code: ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'monospace'],
  text: ['Inter', 'Roboto', 'Open Sans', 'sans-serif'],
};
