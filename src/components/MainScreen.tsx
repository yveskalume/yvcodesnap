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
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />


      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">YvCode</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Add simplified user profile or links if needed later */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span>New Templates Available</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent tracking-tight">
            What will you create today?
          </h1>
          <p className="text-lg text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Create beautiful code screenshots, diagrams, and social cards in seconds.
          </p>
        </div>

        {/* Create New Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* New Blank */}
            <button
              onClick={handleNewSnap}
              className="group relative h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-2xl p-8 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/10">
                  <Plus className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">Blank Canvas</h3>
                <p className="text-sm text-neutral-400 mb-6 leading-relaxed">Start from scratch. Create specific dimensions or freeform designs.</p>

                <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-blue-400 transition-colors">
                  <span>Create new</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </button>

            {/* Import File */}
            <button
              onClick={handleImportFile}
              className="group relative h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-2xl p-8 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-purple-500/10">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">Import File</h3>
                <p className="text-sm text-neutral-400 mb-6 leading-relaxed">Open an existing .yvsnap project file to continue working.</p>

                <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-purple-400 transition-colors">
                  <span>Import</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </button>

            {/* Quick Template */}
            <button
              onClick={() => setActiveTab('templates')}
              className="group relative h-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-8 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/10">
                  <Layout className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-emerald-400 transition-colors">Use Template</h3>
                <p className="text-sm text-neutral-400 mb-6 leading-relaxed">Jumpstart your design with our pre-made professional templates.</p>

                <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-emerald-400 transition-colors">
                  <span>Browse gallery</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Tabs - Segmented Control Style */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'recent'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Recent Work</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'templates'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Templates</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'recent' && (
          <section className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            {recentSnaps.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.02] border border-white/[0.08] rounded-2xl border-dashed">
                <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">No recent work</h3>
                <p className="text-neutral-500 mb-8 max-w-sm mx-auto">Projects you create or import will appear here for quick access.</p>
                <button
                  onClick={handleNewSnap}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create your first snap
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-neutral-400 font-medium">{recentSnaps.length} recent project{recentSnaps.length !== 1 ? 's' : ''}</p>
                  <button
                    onClick={() => {
                      if (confirm('Clear all recent projects?')) {
                        clearRecentSnaps();
                      }
                    }}
                    className="text-sm text-neutral-500 hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-red-400/10 rounded-lg"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentSnaps.map((entry) => (
                    <div
                      key={entry.id}
                      className="group relative bg-neutral-900 border border-white/[0.08] rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 duration-300"
                    >
                      {/* Preview */}
                      <button
                        onClick={() => handleOpenRecent(entry.snap)}
                        className="w-full aspect-video relative overflow-hidden bg-[#1e1e1e]"
                      >
                        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                          <SnapPreview snap={entry.snap} />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm font-medium shadow-xl">Open Project</span>
                        </div>
                      </button>

                      {/* Info */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-lg truncate mb-1 group-hover:text-blue-400 transition-colors">{entry.title}</h3>
                            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{formatRelativeTime(entry.savedAt)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSnap(entry.id);
                            }}
                            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove from recent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-3 text-xs text-neutral-500 font-medium">
                          <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">{entry.snap.meta.width} × {entry.snap.meta.height}</span>
                          <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">{entry.snap.elements.length} element{entry.snap.elements.length !== 1 ? 's' : ''}</span>
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
          <section className="animate-in fade-in duration-300 slide-in-from-bottom-4">
            <p className="text-sm text-neutral-400 font-medium mb-6">{templates.length} templates available</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group relative bg-neutral-900 border border-white/[0.08] rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 duration-300"
                >
                  {/* Preview */}
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full aspect-video relative overflow-hidden bg-[#1e1e1e]"
                  >
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                      <SnapPreview snap={template.snap} />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="px-4 py-2 bg-emerald-500/90 backdrop-blur-md rounded-xl text-sm font-medium shadow-xl">Use Template</span>
                    </div>
                  </button>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-lg group-hover:text-emerald-400 transition-colors">{template.name}</h3>
                      {['flowchart-starter', 'microservices-arch', 'geometric-pop'].includes(template.id) && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-500/20">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400 line-clamp-2">{template.description}</p>
                    <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-3 text-xs text-neutral-500 font-medium">
                      <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">{template.snap.meta.width} × {template.snap.meta.height}</span>
                      <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">{template.snap.elements.length} element{template.snap.elements.length !== 1 ? 's' : ''}</span>
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
