"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { documentsAPI } from '@/services/api';
import { FileText, Plus, Clock, Users, Trash2, Edit3, Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const res = await documentsAPI.getAll();
            setDocuments(res.data);
        } catch { setDocuments([]); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Researcher'}</h1>
                        <p className="text-[var(--muted-foreground)]">Manage your research papers</p>
                    </div>
                    <Link href="/editor" className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />New Paper</Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" /></div>
                ) : documents.length === 0 ? (
                    <div className="card text-center py-16">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No papers yet</h3>
                        <p className="text-[var(--muted-foreground)] mb-6">Create your first research paper</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/generate" className="btn-secondary">Generate with AI</Link>
                            <Link href="/editor" className="btn-primary">Start Writing</Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map(doc => (
                            <Link key={doc._id} href={`/editor/${doc._id}`} className="card group hover:border-[var(--primary)]/50">
                                <div className="flex items-start justify-between mb-4">
                                    <FileText className="w-10 h-10 p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]" />
                                    <span className="text-xs px-2 py-1 rounded bg-[var(--secondary)]">{doc.status}</span>
                                </div>
                                <h3 className="font-semibold mb-2 group-hover:text-[var(--primary)]">{doc.title}</h3>
                                <p className="text-sm text-[var(--muted-foreground)] mb-4">{doc.domain}</p>
                                <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{doc.collaborators?.length || 0}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
