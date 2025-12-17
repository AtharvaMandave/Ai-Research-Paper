"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
    Eye,
    EyeOff,
    Download,
    History,
    BookOpen,
    Plus,
    Search,
    FileText,
    Trash2,
    Loader2,
    Share2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const ResearchEditor = dynamic(
    () => import('@/components/ResearchEditor'),
    { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" /></div> }
);

const IEEEPreview = dynamic(
    () => import('@/components/IEEEPreview'),
    { ssr: false }
);

import { useSearchParams } from 'next/navigation';
import { documentsAPI } from '@/services/api';

function EditorContent() {
    const searchParams = useSearchParams();
    const documentId = searchParams.get('id');
    const exportContainerRef = useRef(null);

    const [showPreview, setShowPreview] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [activeTab, setActiveTab] = useState('references');
    const [content, setContent] = useState(null);
    const [title, setTitle] = useState('Untitled Research Paper');
    const [loading, setLoading] = useState(false);
    const [references, setReferences] = useState([]);
    const [newDoi, setNewDoi] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (documentId) {
            fetchDocument(documentId);
        }
    }, [documentId]);

    const fetchDocument = async (id) => {
        try {
            setLoading(true);
            const response = await documentsAPI.getOne(id);
            const doc = response.data;
            setTitle(doc.title);
            setContent(doc.content);
        } catch (error) {
            console.error('Failed to fetch document:', error);
        } finally {
            setLoading(false);
        }
    };

    const addReference = async () => {
        if (!newDoi.trim()) return;
        setLoading(true);
        setTimeout(() => {
            const mockRef = {
                id: Date.now(),
                citationNumber: references.length + 1,
                title: `Research Paper from DOI: ${newDoi}`,
                authors: ['J. Doe', 'A. Smith'],
                year: 2024,
                journal: 'IEEE Transactions on AI'
            };
            setReferences([...references, mockRef]);
            setNewDoi('');
            setLoading(false);
        }, 1000);
    };

    const handleExportPDF = async () => {
        try {
            setExporting(true);
            setShowExportMenu(false);
            const html2pdf = (await import('html2pdf.js')).default;
            const element = exportContainerRef.current?.querySelector('#ieee-export-content');
            if (!element) {
                alert("Export failed. Please try again.");
                setExporting(false);
                return;
            }
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_IEEE.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Failed to export PDF.");
        } finally {
            setExporting(false);
        }
    };

    const handleExportDOCX = async () => {
        try {
            setExporting(true);
            setShowExportMenu(false);
            const { asBlob } = await import('html-docx-js-typescript');
            const { saveAs } = await import('file-saver');
            const element = exportContainerRef.current?.querySelector('#ieee-export-content');
            if (!element) {
                alert("Export failed. Please try again.");
                setExporting(false);
                return;
            }
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${element.innerHTML}</body></html>`;
            const blob = await asBlob(html);
            saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_IEEE.docx`);
        } catch (error) {
            console.error("DOCX Export failed:", error);
            alert("Failed to export DOCX.");
        } finally {
            setExporting(false);
        }
    };

    const handleExportMD = () => {
        if (!content) {
            alert("No content to export.");
            return;
        }
        let exportText = '';
        if (typeof content === 'string') {
            exportText = content;
        } else if (typeof content === 'object') {
            try {
                const extractText = (node) => {
                    if (!node) return '';
                    if (node.text) return node.text;
                    if (node.content) return node.content.map(extractText).join('\n');
                    return '';
                };
                exportText = extractText(content);
            } catch (e) {
                exportText = JSON.stringify(content, null, 2);
            }
        }
        const blob = new Blob([exportText], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    if (!mounted) return null;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-[var(--background)] overflow-hidden" onClick={() => setShowExportMenu(false)}>
            {/* Hidden Export Container */}
            <div ref={exportContainerRef} className="absolute -left-[9999px] top-0 w-[8.5in] bg-white">
                <div id="ieee-export-content">
                    <IEEEPreview document={{ title, content, sections: [], keywords: [] }} />
                </div>
            </div>

            {/* Top Bar */}
            <header className="h-16 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-transparent text-sm font-semibold focus:outline-none text-[var(--foreground)] w-64 transition-colors"
                            />
                            <span className="text-[10px] text-[var(--muted-foreground)]">Last edited just now</span>
                        </div>
                    </div>
                    <span className="badge badge-warning ml-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Unsaved
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`btn-ghost h-9 px-4 text-xs gap-2 rounded-lg transition-all duration-200 ${showPreview ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20' : 'border border-transparent'}`}
                    >
                        {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPreview ? 'Hide Preview' : 'IEEE Preview'}
                    </button>

                    <div className="w-px h-6 bg-[var(--border)]" />

                    <button className="btn-secondary h-9 px-4 text-xs gap-2 rounded-lg">
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </button>

                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={exporting}
                            className="btn-primary h-9 px-5 text-xs gap-2 rounded-lg"
                        >
                            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            {exporting ? 'Exporting...' : 'Export'}
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-60 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl py-2 z-50 animate-fade-in-scale overflow-hidden">
                                <div className="px-4 py-2 text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">IEEE Format</div>
                                <button onClick={handleExportPDF} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[var(--secondary)] transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                        <FileText className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">PDF Document</div>
                                        <div className="text-[11px] text-[var(--muted-foreground)]">Best for printing</div>
                                    </div>
                                </button>
                                <button onClick={handleExportDOCX} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[var(--secondary)] transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <FileText className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Word Document</div>
                                        <div className="text-[11px] text-[var(--muted-foreground)]">Editable .docx file</div>
                                    </div>
                                </button>
                                <div className="h-px bg-[var(--border)] my-2 mx-4" />
                                <div className="px-4 py-2 text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">Raw Content</div>
                                <button onClick={handleExportMD} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[var(--secondary)] transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center group-hover:bg-zinc-500/20 transition-colors">
                                        <FileText className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Markdown</div>
                                        <div className="text-[11px] text-[var(--muted-foreground)]">Plain text format</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`p-2 rounded-lg transition-all duration-200 ${showSidebar ? 'bg-[var(--secondary)] text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'}`}
                    >
                        {showSidebar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out ${showPreview ? 'w-1/2' : 'w-full'}`}>
                    <ResearchEditor
                        content={content}
                        onChange={setContent}
                        onAIAction={() => { }}
                        placeholder="Start writing or paste your research paper content here..."
                    />
                </div>

                {/* Preview Pane */}
                {showPreview && (
                    <div className="w-1/2 border-l border-[var(--border)] bg-zinc-100 flex flex-col animate-slide-right">
                        <div className="h-12 border-b border-zinc-200 bg-white/80 backdrop-blur flex items-center justify-between px-5 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">IEEE Preview</span>
                            </div>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Live</span>
                        </div>
                        <div className="flex-1 overflow-auto p-8">
                            <div className="bg-white shadow-2xl min-h-[800px] w-full max-w-[21cm] mx-auto rounded-sm ring-1 ring-black/5">
                                <IEEEPreview document={{ title, content, sections: [], keywords: [] }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Sidebar */}
                {showSidebar && (
                    <div className="w-80 border-l border-[var(--border)] bg-[var(--background)] flex flex-col shrink-0 animate-slide-right">
                        <div className="p-2 border-b border-[var(--border)]">
                            <div className="flex gap-1 p-1 bg-[var(--secondary)]/50 rounded-lg">
                                {[{ id: 'references', label: 'References', icon: BookOpen }, { id: 'history', label: 'History', icon: History }].map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${activeTab === tab.id ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {activeTab === 'references' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                                        <input
                                            type="text"
                                            placeholder="Search references..."
                                            className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                                        />
                                    </div>

                                    <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 to-violet-500/5 border border-[var(--primary)]/10">
                                        <div className="text-xs font-medium text-[var(--foreground)] mb-2">Add Reference</div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newDoi}
                                                onChange={(e) => setNewDoi(e.target.value)}
                                                placeholder="Paste DOI or URL..."
                                                className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
                                            />
                                            <button
                                                onClick={addReference}
                                                disabled={loading || !newDoi}
                                                className="btn-primary h-auto py-2 px-3 rounded-lg disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {references.length === 0 ? (
                                            <div className="text-center py-12 rounded-xl bg-[var(--secondary)]/30 border border-dashed border-[var(--border)]">
                                                <div className="w-12 h-12 rounded-full bg-[var(--secondary)] mx-auto mb-3 flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-[var(--muted-foreground)]" />
                                                </div>
                                                <p className="text-sm font-medium text-[var(--foreground)]">No references yet</p>
                                                <p className="text-xs text-[var(--muted-foreground)] mt-1">Add DOI links to manage citations</p>
                                            </div>
                                        ) : (
                                            references.map((ref) => (
                                                <div key={ref.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-200 group">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full font-bold">[{ref.citationNumber}]</span>
                                                        <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-400/10 transition-all">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-medium mt-2 line-clamp-2 text-[var(--foreground)]">{ref.title}</p>
                                                    <p className="text-xs text-[var(--muted-foreground)] mt-2">{ref.authors[0]} et al. • {ref.year}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center ring-2 ring-[var(--primary)]/20">
                                            <History className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Current Version</p>
                                            <p className="text-xs text-[var(--muted-foreground)]">Edited just now</p>
                                        </div>
                                        <span className="ml-auto badge badge-success">Active</span>
                                    </div>
                                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                                        <p className="text-xs">No previous versions</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[var(--background)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        }>
            <EditorContent />
        </Suspense>
    );
}
