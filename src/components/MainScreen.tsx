import { useState } from 'react';
import { Plus, FileText, Layout, Clock, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useRecentSnapsStore, formatRelativeTime } from '../store/recentSnapsStore';
import { useCanvasStore } from '../store/canvasStore';
import { templates, type Template } from '../data/templates';
import SnapPreview from './SnapPreview';
import type { Snap } from '../types';

interface MainScreenProps {
  onOpenEditor: () => void;
}

export default function MainScreen({ onOpenEditor }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'templates'>('recent');
  const { recentSnaps, removeRecentSnap, clearRecentSnaps } = useRecentSnapsStore();
  const { setSnap, newSnap } = useCanvasStore();

  const handleNewSnap = () => {
    newSnap({ title: 'Untitled', aspect: '16:9', width: 1920, height: 1080 });
    onOpenEditor();
  };

  const handleOpenRecent = (snap: Snap) => {
    setSnap(snap);
    onOpenEditor();
  };

  const handleUseTemplate = (template: Template) => {
    setSnap(template.snap);
    onOpenEditor();
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yvsnap';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const json = evt.target?.result as string;
            const snap = JSON.parse(json) as Snap;
            setSnap(snap);
            onOpenEditor();
          } catch {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold">YvCode</h1>
              <p className="text-sm text-neutral-400">Create beautiful code screenshots</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Create New Section */}
        <section className="mb-10">
          <h2 className="text-lg font-medium mb-4">Create New</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New Blank */}
            <button
              onClick={handleNewSnap}
              className="group relative bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:bg-white/[0.03] transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 bg-white/[0.05] group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
              </div>
              <h3 className="font-medium mb-1">Blank Canvas</h3>
              <p className="text-sm text-neutral-500">Start from scratch with a fresh canvas</p>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
            </button>

            {/* Import File */}
            <button
              onClick={handleImportFile}
              className="group relative bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:bg-white/[0.03] transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 bg-white/[0.05] group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <FileText className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
              </div>
              <h3 className="font-medium mb-1">Import File</h3>
              <p className="text-sm text-neutral-500">Open an existing .yvsnap project file</p>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
            </button>

            {/* Quick Template */}
            <button
              onClick={() => setActiveTab('templates')}
              className="group relative bg-neutral-900 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:bg-white/[0.03] transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 bg-white/[0.05] group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Layout className="w-6 h-6 text-neutral-400 group-hover:text-blue-400" />
              </div>
              <h3 className="font-medium mb-1">Use Template</h3>
              <p className="text-sm text-neutral-500">Start with a pre-designed template</p>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/[0.08] mb-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'recent'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Clock className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            Recent Work
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Sparkles className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            Templates
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'recent' && (
          <section>
            {recentSnaps.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No recent work</h3>
                <p className="text-neutral-500 mb-6">Your recent projects will appear here</p>
                <button
                  onClick={handleNewSnap}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create your first snap
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-neutral-500">{recentSnaps.length} recent project{recentSnaps.length !== 1 ? 's' : ''}</p>
                  <button
                    onClick={() => {
                      if (confirm('Clear all recent projects?')) {
                        clearRecentSnaps();
                      }
                    }}
                    className="text-sm text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentSnaps.map((entry) => (
                    <div
                      key={entry.id}
                      className="group relative bg-neutral-900 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                    >
                      {/* Preview */}
                      <button
                        onClick={() => handleOpenRecent(entry.snap)}
                        className="w-full aspect-video relative overflow-hidden"
                      >
                        <SnapPreview snap={entry.snap} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm">Open</span>
                        </div>
                      </button>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{entry.title}</h3>
                            <p className="text-sm text-neutral-500">{formatRelativeTime(entry.savedAt)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSnap(entry.id);
                            }}
                            className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                          <span>{entry.snap.meta.width}×{entry.snap.meta.height}</span>
                          <span>•</span>
                          <span>{entry.snap.elements.length} element{entry.snap.elements.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === 'templates' && (
          <section>
            <p className="text-sm text-neutral-500 mb-4">{templates.length} templates available</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group relative bg-neutral-900 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
                >
                  {/* Preview */}
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full aspect-video relative overflow-hidden"
                  >
                    <SnapPreview snap={template.snap} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-sm">Use Template</span>
                    </div>
                  </button>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium mb-1">{template.name}</h3>
                    <p className="text-sm text-neutral-500">{template.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                      <span>{template.snap.meta.width}×{template.snap.meta.height}</span>
                      <span>•</span>
                      <span>{template.snap.elements.length} element{template.snap.elements.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-sm text-neutral-600 text-center">
            YvCode — Create beautiful code screenshots for social media
          </p>
        </div>
      </footer>
    </div>
  );
}
