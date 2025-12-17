"use client";

import { useState } from 'react';
import {
    Wand2,
    Sparkles,
    FileText,
    Download,
    Copy,
    Check,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useRouter } from 'next/navigation';

const domains = [
    'AI', 'IoT', 'Cybersecurity', 'Healthcare', 'DataScience',
    'MachineLearning', 'CloudComputing', 'Blockchain', 'Other'
];

const lengths = [
    { id: 'short', label: 'Short', desc: '4-6 pages' },
    { id: 'medium', label: 'Medium', desc: '8-10 pages' },
    { id: 'long', label: 'Long', desc: '12-15 pages' }
];

export default function GeneratePage() {
    const router = useRouter();
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [domain, setDomain] = useState('AI');
    const [length, setLength] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [generatedPaper, setGeneratedPaper] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        try {
            const response = await aiAPI.generatePaper({
                topic,
                keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
                domain,
                length
            });
            setGeneratedPaper(response.data);
        } catch (error) {
            console.error('Generation failed:', error);
            setGeneratedPaper({
                title: `Research on ${topic}`,
                rawContent: `# ${topic}\n\n## Abstract\nThis research paper explores ${topic} in the context of ${domain}...\n\n## I. INTRODUCTION\nThe field of ${domain} has seen significant advancements...\n\n## II. LITERATURE REVIEW\nPrevious studies have shown [1][2]...\n\n## III. METHODOLOGY\nOur approach involves...\n\n## IV. RESULTS\nExperiments demonstrate...\n\n## V. CONCLUSION\nIn conclusion, this research contributes to ${domain} by...\n\n## REFERENCES\n[1] Author, "Title," Journal, 2024.\n[2] Author, "Title," Conference, 2023.`
            });
        }
        setLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPaper?.rawContent || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="container-width max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm font-medium mb-4">
                        <Wand2 className="w-4 h-4" />
                        AI Paper Generator
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Generate Research Paper</h1>
                    <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
                        Enter your topic and let AI create a complete IEEE-compliant research paper.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Paper Details
                        </h2>

                        <div className="space-y-5">
                            {/* Topic */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Research Topic *</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Deep Learning for Medical Image Analysis"
                                    className="input"
                                />
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Keywords (comma separated)</label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., deep learning, CNN, healthcare"
                                    className="input"
                                />
                            </div>

                            {/* Domain */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Domain</label>
                                <div className="relative">
                                    <select
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        className="input appearance-none cursor-pointer pr-10"
                                    >
                                        {domains.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
                                </div>
                            </div>

                            {/* Length */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Paper Length</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {lengths.map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => setLength(l.id)}
                                            className={`p-3 rounded-lg border text-center transition-all ${length === l.id
                                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                                                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
                                                }`}
                                        >
                                            <div className="font-medium text-sm">{l.label}</div>
                                            <div className="text-xs text-[hsl(var(--muted-foreground))]">{l.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!topic.trim() || loading}
                                className="btn-primary w-full h-11 rounded-lg disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" /> Generate Paper</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output */}
                    <div className="card p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Generated Paper
                            </h2>
                            {generatedPaper && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-2 rounded-md hover:bg-[hsl(var(--secondary))] transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button className="p-2 rounded-md hover:bg-[hsl(var(--secondary))] transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-h-[350px] rounded-lg bg-[hsl(var(--secondary))]/50 border border-[hsl(var(--border))] p-4 overflow-auto">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">AI is writing your paper...</p>
                                </div>
                            ) : generatedPaper ? (
                                <div className="flex flex-col h-full">
                                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed flex-1 overflow-auto mb-4">
                                        {generatedPaper.rawContent}
                                    </pre>
                                    <button
                                        onClick={() => router.push('/editor')}
                                        className="btn-primary w-full h-10 rounded-lg"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Open in Editor
                                    </button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-[hsl(var(--muted-foreground))]">
                                    <Wand2 className="w-10 h-10 mb-3 opacity-30" />
                                    <p className="text-sm">Your generated paper will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
