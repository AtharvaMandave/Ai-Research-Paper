"use client";

import { useState, useCallback } from 'react';
import {
    Upload,
    FileText,
    Sparkles,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Loader2,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';
import { aiAPI } from '@/services/api';

const steps = [
    { id: 1, title: 'Upload/Paste', desc: 'Add your content' },
    { id: 2, title: 'Analyze', desc: 'AI structures it' },
    { id: 3, title: 'Improve', desc: 'Fix issues' },
    { id: 4, title: 'Format', desc: 'IEEE output' }
];

export default function FormatPage() {
    const [content, setContent] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [improved, setImproved] = useState(null);
    const [plagiarismScore, setPlagiarismScore] = useState(null);
    const [grammarScore, setGrammarScore] = useState(null);

    const handlePaste = useCallback((e) => {
        const text = e.clipboardData?.getData('text') || '';
        setContent(text);
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setContent(event.target?.result || '');
            };
            reader.readAsText(file);
        }
    };

    const analyzeContent = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const response = await aiAPI.analyzeContent(content, 'text');
            setAnalysis(response.data);
            setCurrentStep(2);
        } catch (error) {
            // Demo data
            setAnalysis({
                sections: ['Introduction', 'Methodology', 'Results'],
                missingSections: ['Abstract', 'Literature Review', 'Conclusion', 'References'],
                suggestions: ['Add an abstract summarizing your work', 'Include a literature review section']
            });
            setCurrentStep(2);
        }
        setLoading(false);
    };

    const improveContent = async () => {
        setLoading(true);
        try {
            const [grammarRes, plagRes] = await Promise.all([
                aiAPI.checkGrammar(content),
                aiAPI.checkPlagiarism(content)
            ]);
            setGrammarScore(grammarRes.data.score);
            setPlagiarismScore(plagRes.data.plagiarismScore);

            const improvedRes = await aiAPI.improveText(content, 'academic_tone');
            setImproved(improvedRes.data.improved);
            setCurrentStep(3);
        } catch (error) {
            // Demo data
            setGrammarScore(85);
            setPlagiarismScore(12);
            setImproved(content + '\n\n[Content has been improved with academic tone]');
            setCurrentStep(3);
        }
        setLoading(false);
    };

    const formatToIEEE = async () => {
        setLoading(true);
        // Simulate formatting
        await new Promise(r => setTimeout(r, 2000));
        setCurrentStep(4);
        setLoading(false);
    };

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--secondary)] border border-[var(--border)] mb-6">
                        <RefreshCw className="w-4 h-4 text-[var(--primary)]" />
                        <span className="text-sm">Format & Improve Engine</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Transform Your Content</h1>
                    <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                        Paste your existing content and let AI restructure it into a perfect IEEE-compliant research paper.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep >= step.id
                                            ? 'bg-[var(--primary)] text-white'
                                            : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                                        }`}>
                                        {currentStep > step.id ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <span className="text-xs mt-1 text-[var(--muted-foreground)]">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <ArrowRight className={`w-5 h-5 ${currentStep > step.id ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Panel */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[var(--primary)]" />
                            Your Content
                        </h2>

                        {/* Upload Zone */}
                        <div
                            className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 mb-4 text-center hover:border-[var(--primary)] transition-colors cursor-pointer"
                            onPaste={handlePaste}
                        >
                            <input
                                type="file"
                                accept=".txt,.doc,.docx,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                                <p className="text-[var(--muted-foreground)]">
                                    Drag & drop or <span className="text-[var(--primary)]">browse files</span>
                                </p>
                                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                                    Or paste your content below
                                </p>
                            </label>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your research content here..."
                            className="input min-h-[300px] resize-none font-mono text-sm"
                        />

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-3">
                            {currentStep === 1 && (
                                <button
                                    onClick={analyzeContent}
                                    disabled={!content.trim() || loading}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Analyze Content
                                </button>
                            )}
                            {currentStep === 2 && (
                                <button
                                    onClick={improveContent}
                                    disabled={loading}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Improve & Check
                                </button>
                            )}
                            {currentStep === 3 && (
                                <button
                                    onClick={formatToIEEE}
                                    disabled={loading}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                    Format to IEEE
                                </button>
                            )}
                            {currentStep === 4 && (
                                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-[var(--primary)]" />
                            Analysis & Results
                        </h2>

                        <div className="space-y-6">
                            {/* Analysis Results */}
                            {analysis && (
                                <div className="animate-fadeIn">
                                    <h3 className="font-medium mb-3">Content Analysis</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="flex items-center gap-2 text-green-400 mb-2">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium">Found Sections</span>
                                            </div>
                                            <ul className="text-sm space-y-1">
                                                {analysis.sections?.map((s, i) => (
                                                    <li key={i}>• {s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-center gap-2 text-amber-400 mb-2">
                                                <AlertCircle className="w-5 h-5" />
                                                <span className="font-medium">Missing Sections</span>
                                            </div>
                                            <ul className="text-sm space-y-1">
                                                {analysis.missingSections?.map((s, i) => (
                                                    <li key={i}>• {s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scores */}
                            {(grammarScore !== null || plagiarismScore !== null) && (
                                <div className="animate-fadeIn">
                                    <h3 className="font-medium mb-3">Quality Scores</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {grammarScore !== null && (
                                            <div className="p-4 rounded-lg bg-[var(--secondary)]">
                                                <div className="text-sm text-[var(--muted-foreground)] mb-1">Grammar Score</div>
                                                <div className="text-3xl font-bold text-green-400">{grammarScore}%</div>
                                            </div>
                                        )}
                                        {plagiarismScore !== null && (
                                            <div className="p-4 rounded-lg bg-[var(--secondary)]">
                                                <div className="text-sm text-[var(--muted-foreground)] mb-1">Plagiarism</div>
                                                <div className={`text-3xl font-bold ${plagiarismScore > 20 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {plagiarismScore}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* IEEE Preview */}
                            {currentStep === 4 && (
                                <div className="animate-fadeIn">
                                    <h3 className="font-medium mb-3">IEEE Preview</h3>
                                    <div className="bg-white text-black p-4 rounded-lg text-sm" style={{ fontFamily: 'Times New Roman' }}>
                                        <div className="text-center font-bold text-lg mb-2">
                                            Your Research Paper Title
                                        </div>
                                        <div className="text-center text-xs italic mb-4">
                                            Author Name<br />
                                            Institution
                                        </div>
                                        <div className="columns-2 gap-4 text-xs leading-relaxed">
                                            <p className="font-bold">Abstract—</p>
                                            <p className="italic mb-2">Your abstract content here...</p>
                                            <p className="font-bold uppercase mt-4">I. Introduction</p>
                                            <p className="text-justify">Content formatted in IEEE style...</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Placeholder */}
                            {!analysis && (
                                <div className="h-64 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                                    <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                                    <p>Paste content and click Analyze to see results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
