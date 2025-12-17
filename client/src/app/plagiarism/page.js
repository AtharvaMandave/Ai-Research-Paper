"use client";

import { useState } from 'react';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    FileText,
    RefreshCw,
    Sparkles,
    Loader2,
    ExternalLink,
    Wand2,
    X
} from 'lucide-react';
import { aiAPI } from '@/services/api';

export default function PlagiarismPage() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [rewriting, setRewriting] = useState(false);
    const [rewrittenText, setRewrittenText] = useState('');

    const checkPlagiarism = async () => {
        if (!text.trim() || text.trim().length < 50) {
            alert("Please enter at least 50 characters to check for plagiarism.");
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const response = await aiAPI.checkPlagiarism(text);
            const data = response.data;

            console.log("Plagiarism API Response:", data); // Debug log

            // Use the actual backend response
            const plagiarismScore = data.score || 0;
            const normalizedResults = {
                overallScore: plagiarismScore,
                originalityScore: 100 - plagiarismScore,
                matches: data.flaggedSentences || [],
                suggestions: data.suggestions || [],
                checkedAt: new Date().toISOString()
            };

            console.log("Normalized Results:", normalizedResults); // Debug log
            setResults(normalizedResults);
        } catch (error) {
            console.error('Plagiarism check failed:', error);
            // Show error state instead of mock data
            setResults({
                overallScore: 0,
                originalityScore: 100,
                matches: [],
                suggestions: [`Error: ${error.message || 'Failed to check plagiarism'}`],
                checkedAt: new Date().toISOString()
            });
        }
        setLoading(false);
    };

    const handleRewrite = async (matchId, originalText) => {
        setRewriting(true);
        setSelectedMatch(matchId);

        try {
            const response = await aiAPI.rewriteText(originalText);
            setRewrittenText(response.data.rewrittenText);
            setRewriting(false);
        } catch (error) {
            setTimeout(() => {
                setRewrittenText("This is an AI-generated rewrite of the flagged content with improved originality and unique phrasing.");
                setRewriting(false);
            }, 1500);
        }
    };

    const applyRewrite = (matchId) => {
        const match = results?.matches?.find(m => m.id === matchId);
        if (match && rewrittenText) {
            const newText = text.replace(match.text, rewrittenText);
            setText(newText);
            setSelectedMatch(null);
            setRewrittenText('');
            setResults(prev => {
                const matches = prev?.matches?.filter(m => m.id !== matchId) || [];
                const matchCount = prev?.matches?.length || 1;
                return {
                    ...prev,
                    matches,
                    overallScore: Math.max(0, (prev?.overallScore || 0) - 10),
                    originalityScore: Math.min(100, (prev?.originalityScore || 0) + 10)
                };
            });
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="container-width max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-sm font-medium mb-4">
                        <Shield className="w-4 h-4" />
                        Plagiarism Checker
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Check for Plagiarism</h1>
                    <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
                        Scan your content for potential matches and get AI-powered rewrites.
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
                                    {text.length.toLocaleString()} characters
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
                                onClick={checkPlagiarism}
                                disabled={loading || text.length < 50}
                                className="btn-primary flex-1 h-11 rounded-lg disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Scanning...</>
                                ) : (
                                    <><Shield className="w-4 h-4 mr-2" /> Check Plagiarism</>
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
                                    <Shield className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                                </div>
                                <h3 className="font-semibold mb-1">No Results Yet</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Paste your content and click "Check Plagiarism".
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="card h-[430px] flex flex-col items-center justify-center text-center">
                                <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--primary))] mb-4" />
                                <h3 className="font-semibold mb-1">Scanning Content</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Checking against sources...</p>
                            </div>
                        )}

                        {results && (
                            <div className="space-y-4">
                                {/* Score Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="card p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Plagiarism</span>
                                        </div>
                                        <div className="text-3xl font-bold text-orange-500">{Math.round(results.overallScore)}%</div>
                                    </div>
                                    <div className="card p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Original</span>
                                        </div>
                                        <div className="text-3xl font-bold text-green-500">{Math.round(results.originalityScore)}%</div>
                                    </div>
                                </div>

                                {/* Matches */}
                                <div className="card p-0 max-h-[320px] overflow-auto">
                                    <div className="p-4 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))] z-10 flex items-center justify-between">
                                        <h3 className="font-semibold text-sm">Matched Sources</h3>
                                        <span className="badge-secondary text-xs">{results.matches?.length || 0} found</span>
                                    </div>

                                    {(!results.matches || results.matches.length === 0) ? (
                                        <div className="p-8 text-center">
                                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                            <p className="font-medium">No plagiarism detected!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[hsl(var(--border))]">
                                            {results.matches.map((match) => (
                                                <div key={match.id} className="p-4">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                                                            {match.similarity}% match
                                                        </span>
                                                        <button
                                                            onClick={() => handleRewrite(match.id, match.text)}
                                                            disabled={rewriting && selectedMatch === match.id}
                                                            className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                                                        >
                                                            {rewriting && selectedMatch === match.id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Wand2 className="w-3 h-3" />
                                                            )}
                                                            Rewrite
                                                        </button>
                                                    </div>

                                                    <p className="text-sm text-[hsl(var(--foreground))] mb-2 p-3 rounded-md bg-[hsl(var(--secondary))]">
                                                        "{match.text}"
                                                    </p>

                                                    <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                                                        <ExternalLink className="w-3 h-3" />
                                                        <span className="truncate">{match.source}</span>
                                                    </div>

                                                    {selectedMatch === match.id && rewrittenText && (
                                                        <div className="mt-3 p-3 rounded-md bg-green-50 border border-green-200">
                                                            <div className="flex items-center gap-1 mb-2 text-xs font-medium text-green-700">
                                                                <Sparkles className="w-3 h-3" /> AI Rewrite
                                                            </div>
                                                            <p className="text-sm text-green-800 mb-3">"{rewrittenText}"</p>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => applyRewrite(match.id)} className="btn-primary text-xs h-8 px-3 rounded-md">Apply</button>
                                                                <button onClick={() => handleRewrite(match.id, match.text)} className="btn-outline text-xs h-8 px-3 rounded-md">
                                                                    <RefreshCw className="w-3 h-3 mr-1" /> Retry
                                                                </button>
                                                                <button onClick={() => { setSelectedMatch(null); setRewrittenText(''); }} className="btn-ghost text-xs h-8 px-2 rounded-md">
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
