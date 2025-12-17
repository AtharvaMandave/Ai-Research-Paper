"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Sparkles,
    Undo,
    Redo,
    List,
    ListOrdered,
    Quote,
    Code
} from 'lucide-react';
import { useState, useEffect } from 'react';

const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-all duration-200 ${isActive
            ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
            : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
            } ${disabled ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
    >
        {children}
    </button>
);

const Divider = () => (
    <div className="w-px h-6 bg-[var(--border)] mx-1" />
);

export default function ResearchEditor({
    content,
    onChange,
    onAIAction,
    placeholder = "Start writing your research paper...",
    editable = true
}) {
    const [mounted, setMounted] = useState(false);
    const [showAIMenu, setShowAIMenu] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder }),
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
        ],
        content: content || '',
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6',
            },
        },
        onUpdate: ({ editor }) => {
            if (onChange) onChange(editor.getJSON());
            // Count words
            const text = editor.getText();
            setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;
            setSelectedText(from !== to ? editor.state.doc.textBetween(from, to, ' ') : '');
        },
    });

    if (!mounted || !editor) return null;

    const aiActions = [
        { id: 'grammar', label: 'Fix Grammar', icon: '✨' },
        { id: 'academic_tone', label: 'Academic Tone', icon: '🎓' },
        { id: 'remove_plagiarism', label: 'Remove Plagiarism', icon: '🔒' },
        { id: 'expand', label: 'Expand Text', icon: '📝' },
        { id: 'summarize', label: 'Summarize', icon: '📋' },
    ];

    return (
        <div className="flex flex-col h-full bg-[var(--background)]">
            {/* Premium Floating Toolbar */}
            <div className="sticky top-0 z-10 px-4 py-3 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-1 p-1.5 bg-[var(--secondary)]/50 rounded-xl border border-[var(--border)]">
                    {/* Undo/Redo */}
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Text Formatting */}
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                        <UnderlineIcon className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Headings */}
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                        <Heading1 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                        <Heading2 className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                        <Heading3 className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Lists */}
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Alignment */}
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
                        <AlignLeft className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
                        <AlignCenter className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
                        <AlignRight className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Block Elements */}
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                        <Quote className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
                        <Code className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <div className="flex items-center gap-4">
                    {/* Word Count Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--secondary)]/50 rounded-lg border border-[var(--border)]">
                        <span className="text-xs text-[var(--muted-foreground)]">Words:</span>
                        <span className="text-xs font-medium text-[var(--foreground)]">{wordCount.toLocaleString()}</span>
                    </div>

                    {/* AI Action Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowAIMenu(!showAIMenu)}
                            disabled={!selectedText}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedText
                                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-100'
                                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Edit
                        </button>

                        {showAIMenu && selectedText && (
                            <div className="absolute top-full right-0 mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-fade-in-scale z-50">
                                <div className="px-3 py-2 text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold border-b border-[var(--border)]">
                                    AI Actions
                                </div>
                                {aiActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => { onAIAction(action.id, selectedText); setShowAIMenu(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[var(--secondary)] transition-colors"
                                    >
                                        <span className="text-base">{action.icon}</span>
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="h-8 px-4 border-t border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                <div className="flex items-center gap-3">
                    <span>Characters: {editor.getText().length.toLocaleString()}</span>
                    <span>•</span>
                    <span>Words: {wordCount.toLocaleString()}</span>
                    <span>•</span>
                    <span>Reading time: ~{Math.ceil(wordCount / 200)} min</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span>Auto-saving enabled</span>
                </div>
            </div>
        </div>
    );
}
