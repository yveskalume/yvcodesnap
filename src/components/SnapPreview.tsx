import type { Snap, CanvasElement, CodeElement, TextElement, ArrowElement } from '../types';

interface SnapPreviewProps {
  snap: Snap;
}

// Helper to get code theme background color
function getCodeThemeBg(theme: string): string {
  const themes: Record<string, string> = {
    'andromeeda': '#23262e',
    'aurora-x': '#07090f',
    'dark-plus': '#1e1e1e',
    'dracula': '#282a36',
    'dracula-soft': '#282a36',
    'github-dark': '#0d1117',
    'github-dark-dimmed': '#22272e',
    'github-light': '#ffffff',
    'light-plus': '#ffffff',
    'material-theme-darker': '#212121',
    'material-theme-ocean': '#0f111a',
    'material-theme-palenight': '#292d3e',
    'min-dark': '#1f1f1f',
    'min-light': '#ffffff',
    'monokai': '#272822',
    'night-owl': '#011627',
    'nord': '#2e3440',
    'one-dark-pro': '#282c34',
    'poimandres': '#1b1e28',
    'rose-pine': '#191724',
    'rose-pine-moon': '#232136',
    'slack-dark': '#222222',
    'solarized-dark': '#002b36',
    'solarized-light': '#fdf6e3',
    'tokyo-night': '#1a1b26',
    'vesper': '#101010',
    'vitesse-dark': '#121212',
    'vitesse-light': '#ffffff',
  };
  return themes[theme] || '#1e1e1e';
}

// Helper to get highlight color for code lines
function getHighlightColor(lineNum: number, highlights: { from: number; to: number; style: string }[]): string | null {
  for (const h of highlights) {
    if (lineNum >= h.from && lineNum <= h.to) {
      switch (h.style) {
        case 'focus': return 'rgba(251, 191, 36, 0.4)';
        case 'added': return 'rgba(34, 197, 94, 0.4)';
        case 'removed': return 'rgba(239, 68, 68, 0.4)';
      }
    }
  }
  return null;
}

export default function SnapPreview({ snap }: SnapPreviewProps) {
  const { meta, background, elements } = snap;
  const scaleX = 1 / (meta.width / 400); // Scale to fit ~400px width
  const scaleY = 1 / (meta.height / 225); // Scale to fit ~225px height (16:9 aspect)
  const scale = Math.min(scaleX, scaleY);

  const getBackground = () => {
    if (background.type === 'gradient') {
      return `linear-gradient(${background.gradient.angle}deg, ${background.gradient.from}, ${background.gradient.to})`;
    }
    return background.solid.color;
  };

  const renderElement = (element: CanvasElement) => {
    if (!element.visible) return null;

    switch (element.type) {
      case 'code': {
        const codeEl = element as CodeElement;
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: codeEl.x * scale,
              top: codeEl.y * scale,
              width: codeEl.width * scale,
              height: codeEl.height * scale,
              backgroundColor: getCodeThemeBg(codeEl.props.theme),
              borderRadius: codeEl.props.cornerRadius * scale,
              overflow: 'hidden',
              boxShadow: codeEl.props.shadow.blur > 0
                ? `0 ${codeEl.props.shadow.blur * scale * 0.5}px ${codeEl.props.shadow.blur * scale}px ${codeEl.props.shadow.color}`
                : undefined,
            }}
          >
            {/* Code lines preview */}
            <div style={{ padding: codeEl.props.padding * scale * 0.5 }}>
              {codeEl.props.code.split('\n').slice(0, 8).map((line, i) => (
                <div
                  key={i}
                  style={{
                    height: Math.max(2, codeEl.props.fontSize * scale * 0.8),
                    marginBottom: Math.max(1, codeEl.props.fontSize * scale * 0.3),
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  {codeEl.props.lineNumbers && (
                    <div
                      style={{
                        width: Math.max(8, 16 * scale),
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1,
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(20, line.length * 3))}%`,
                      backgroundColor: getHighlightColor(i + 1, codeEl.props.highlights) || 'rgba(255,255,255,0.3)',
                      borderRadius: 1,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'text': {
        const textEl = element as TextElement;
        const fontSize = Math.max(6, textEl.props.fontSize * scale);
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: textEl.x * scale,
              top: textEl.y * scale,
              fontSize,
              fontFamily: textEl.props.fontFamily,
              fontWeight: textEl.props.bold ? 'bold' : 'normal',
              fontStyle: textEl.props.italic ? 'italic' : 'normal',
              color: textEl.props.color,
              whiteSpace: 'pre',
              lineHeight: 1.2,
              padding: textEl.props.background ? textEl.props.padding * scale : 0,
              backgroundColor: textEl.props.background?.color,
              borderRadius: textEl.props.cornerRadius * scale,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {textEl.props.text.length > 50 ? textEl.props.text.slice(0, 50) + '...' : textEl.props.text}
          </div>
        );
      }

      case 'arrow': {
        const arrowEl = element as ArrowElement;
        if (arrowEl.points.length < 2) return null;
        const start = arrowEl.points[0];
        const end = arrowEl.points[arrowEl.points.length - 1];
        
        // Calculate SVG bounds
        const minX = Math.min(start.x, end.x) - 10;
        const minY = Math.min(start.y, end.y) - 10;
        const maxX = Math.max(start.x, end.x) + 10;
        const maxY = Math.max(start.y, end.y) + 10;
        
        return (
          <svg
            key={element.id}
            style={{
              position: 'absolute',
              left: minX * scale,
              top: minY * scale,
              width: (maxX - minX) * scale,
              height: (maxY - minY) * scale,
              overflow: 'visible',
            }}
          >
            <defs>
              <marker
                id={`arrowhead-${element.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={arrowEl.props.color}
                />
              </marker>
            </defs>
            <line
              x1={(start.x - minX) * scale}
              y1={(start.y - minY) * scale}
              x2={(end.x - minX) * scale}
              y2={(end.y - minY) * scale}
              stroke={arrowEl.props.color}
              strokeWidth={Math.max(1, arrowEl.props.thickness * scale)}
              markerEnd={arrowEl.props.head !== 'none' ? `url(#arrowhead-${element.id})` : undefined}
            />
          </svg>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: getBackground() }}
    >
      {elements.map(renderElement)}
    </div>
  );
}
