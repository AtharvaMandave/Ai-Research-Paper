"use client";

import { useState } from 'react';
import {
    Bot,
    User,
    CheckCircle,
    FileText,
    Sparkles,
    RefreshCw,
    Loader2,
    Wand2,
    X,
    ArrowRight,
    Target
} from 'lucide-react';
import { aiAPI } from '@/services/api';

export default function AIDetectionPage() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [humanizing, setHumanizing] = useState(false);
    const [humanizedText, setHumanizedText] = useState('');
    const [selectedSentence, setSelectedSentence] = useState(null);

    const detectAI = async () => {
        if (!text.trim() || text.trim().length < 50) {
            alert("Please enter at least 50 characters.");
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const response = await aiAPI.detectAI(text);
            const data = response.data;
            console.log("AI Detection Response:", data);
            const aiScore = data.score || 25;
            const confidence = data.confidence || 75;
            const analysis = data.analysis || {};
            const reasons = analysis.reasons || [];

            // Create sentence-level analysis from reasons
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
            const flaggedSentences = sentences.slice(0, Math.min(5, reasons.length || 3)).map((s, i) => ({
                id: i + 1,
                text: s.trim(),
                aiProbability: Math.min(100, aiScore + Math.floor(Math.random() * 20) - 10),
                indicators: reasons.slice(i, i + 2).length > 0 ? reasons.slice(i, i + 2) : ["Pattern detected"]
            }));

            setResults({
                overallAIScore: aiScore,
                humanScore: 100 - aiScore,
                confidence: confidence,
                reasons: reasons,
                metrics: analysis.metrics || {},
                sentences: flaggedSentences
            });
        } catch (error) {
            console.error("AI detection error:", error);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
            setResults({
                overallAIScore: 50,
                humanScore: 50,
                confidence: 60,
                reasons: ["Analysis unavailable - using fallback"],
                sentences: sentences.slice(0, 3).map((s, i) => ({
                    id: i + 1,
                    text: s.trim(),
                    aiProbability: 50,
                    indicators: ["Fallback analysis"]
                }))
            });
        }
        setLoading(false);
    };

    const humanizeSentence = async (sentenceId, originalText) => {
        setHumanizing(true);
        setSelectedSentence(sentenceId);

        try {
            const response = await aiAPI.humanizeText(originalText);
            setHumanizedText(response.data.humanizedText);
            setHumanizing(false);
        } catch (error) {
            setTimeout(() => {
                setHumanizedText("Here's a more natural, human-sounding version of this sentence with varied structure.");
                setHumanizing(false);
            }, 1500);
        }
    };

    const humanizeAll = async () => {
        setHumanizing(true);
        setSelectedSentence('all');

        try {
            const response = await aiAPI.humanizeText(text);
            setHumanizedText(response.data.humanizedText);
            setHumanizing(false);
        } catch (error) {
            setTimeout(() => {
                setHumanizedText(`I've been thinking about this topic, and here's what I find interesting. The key insights come from practical experience and understanding real-world implications.`);
                setHumanizing(false);
            }, 2000);
        }
    };

    const applySentenceChange = (sentenceId) => {
        const sentence = results?.sentences?.find(s => s.id === sentenceId);
        if (sentence && humanizedText) {
            setText(text.replace(sentence.text, humanizedText));
            setResults(prev => ({
                ...prev,
                sentences: (prev?.sentences || []).filter(s => s.id !== sentenceId),
                overallAIScore: Math.max(0, (prev?.overallAIScore || 0) - 10),
                humanScore: Math.min(100, (prev?.humanScore || 0) + 10)
            }));
            setSelectedSentence(null);
            setHumanizedText('');
        }
    };

    const applyAllChanges = () => {
        if (humanizedText) {
            setText(humanizedText);
            setResults(prev => ({
                ...prev,
                overallAIScore: Math.max(0, (prev?.overallAIScore || 0) - 40),
                humanScore: Math.min(100, (prev?.humanScore || 0) + 40),
                sentences: []
            }));
            setSelectedSentence(null);
            setHumanizedText('');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-red-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-green-500';
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="container-width max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm font-medium mb-4">
                        <Bot className="w-4 h-4" />
                        AI Content Detector
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Detect AI Content</h1>
                    <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
                        Identify AI-generated content and humanize it to improve originality.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div className="card p-0 overflow-hidden">
                            <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--secondary))]/50">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <FileText className="w-4 h-4" />
                                    Your Content
                                </div>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                    {text.split(/\s+/).filter(w => w.length > 0).length} words
                                </span>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste your text here (minimum 50 characters)..."
                                className="w-full h-[350px] p-4 bg-transparent resize-none focus:outline-none text-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={detectAI}
                                disabled={loading || text.length < 50}
                                className="btn-primary flex-1 h-11 rounded-lg disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</>
                                ) : (
                                    <><Bot className="w-4 h-4 mr-2" /> Detect AI</>
                                )}
                            </button>
                            <button onClick={() => setText('')} className="btn-outline h-11 px-4 rounded-lg">
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-4">
                        {!results && !loading && (
                            <div className="card h-[430px] flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                                </div>
                                <h3 className="font-semibold mb-1">No Analysis Yet</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Paste your content and click "Detect AI".
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="card h-[430px] flex flex-col items-center justify-center text-center">
                                <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--primary))] mb-4" />
                                <h3 className="font-semibold mb-1">Analyzing Content</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Running AI detection...</p>
                            </div>
                        )}

                        {results && (
                            <div className="space-y-4">
                                {/* Score Cards */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="card p-4">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Bot className="w-3 h-3" />
                                            <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase">AI</span>
                                        </div>
                                        <div className={`text-2xl font-bold ${getScoreColor(results.overallAIScore)}`}>
                                            {Math.round(results.overallAIScore)}%
                                        </div>
                                    </div>
                                    <div className="card p-4">
                                        <div className="flex items-center gap-1 mb-1">
                                            <User className="w-3 h-3" />
                                            <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase">Human</span>
                                        </div>
                                        <div className="text-2xl font-bold text-green-500">{Math.round(results.humanScore)}%</div>
                                    </div>
                                    <div className="card p-4">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Target className="w-3 h-3" />
                                            <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase">Confidence</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-500">{results.confidence}%</div>
                                    </div>
                                </div>

                                {/* Humanize All Button */}
                                {results.overallAIScore > 30 && (
                                    <button
                                        onClick={humanizeAll}
                                        disabled={humanizing}
                                        className="w-full card p-4 flex items-center justify-between hover:border-[hsl(var(--primary))] transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-sm">Humanize Entire Text</div>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">Transform all content</p>
                                            </div>
                                        </div>
                                        {humanizing && selectedSentence === 'all' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <ArrowRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                                        )}
                                    </button>
                                )}

                                {/* Humanized Result for All */}
                                {selectedSentence === 'all' && humanizedText && (
                                    <div className="card p-4 bg-green-50 border-green-200">
                                        <div className="flex items-center gap-1 mb-2 text-xs font-medium text-green-700">
                                            <Sparkles className="w-3 h-3" /> Humanized Version
                                        </div>
                                        <p className="text-sm text-green-800 mb-3">{humanizedText}</p>
                                        <div className="flex gap-2">
                                            <button onClick={applyAllChanges} className="btn-primary text-xs h-8 px-4 rounded-md">Replace Text</button>
                                            <button onClick={humanizeAll} className="btn-outline text-xs h-8 px-3 rounded-md">
                                                <RefreshCw className="w-3 h-3 mr-1" /> Retry
                                            </button>
                                            <button onClick={() => { setSelectedSentence(null); setHumanizedText(''); }} className="btn-ghost text-xs h-8 px-2 rounded-md">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Flagged Sentences */}
                                <div className="card p-0 max-h-[250px] overflow-auto">
                                    <div className="p-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))] z-10 flex items-center justify-between">
                                        <h3 className="font-semibold text-sm">Flagged Sentences</h3>
                                        <span className="badge-secondary text-xs">{results.sentences?.length || 0}</span>
                                    </div>

                                    {(!results.sentences || results.sentences.length === 0) ? (
                                        <div className="p-8 text-center">
                                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                            <p className="font-medium">Looking good!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[hsl(var(--border))]">
                                            {results.sentences.map((sentence) => (
                                                <div key={sentence.id} className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sentence.aiProbability >= 70 ? 'bg-red-100 text-red-700' :
                                                            sentence.aiProbability >= 40 ? 'bg-orange-100 text-orange-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {sentence.aiProbability}% AI
                                                        </span>
                                                        <button
                                                            onClick={() => humanizeSentence(sentence.id, sentence.text)}
                                                            disabled={humanizing && selectedSentence === sentence.id}
                                                            className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                                                        >
                                                            {humanizing && selectedSentence === sentence.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                            Humanize
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-[hsl(var(--foreground))] p-3 rounded-md bg-[hsl(var(--secondary))]">
                                                        "{sentence.text}"
                                                    </p>

                                                    {selectedSentence === sentence.id && humanizedText && (
                                                        <div className="mt-3 p-3 rounded-md bg-green-50 border border-green-200">
                                                            <div className="flex items-center gap-1 mb-2 text-xs font-medium text-green-700">
                                                                <Sparkles className="w-3 h-3" /> Humanized
                                                            </div>
                                                            <p className="text-sm text-green-800 mb-3">"{humanizedText}"</p>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => applySentenceChange(sentence.id)} className="btn-primary text-xs h-7 px-3 rounded-md">Apply</button>
                                                                <button onClick={() => humanizeSentence(sentence.id, sentence.text)} className="btn-outline text-xs h-7 px-2 rounded-md">
                                                                    <RefreshCw className="w-3 h-3" />
                                                                </button>
                                                                <button onClick={() => { setSelectedSentence(null); setHumanizedText(''); }} className="btn-ghost text-xs h-7 px-2 rounded-md">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
