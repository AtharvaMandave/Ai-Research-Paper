"use client";

import { useMemo } from 'react';

// Parse content (Markdown string or TipTap JSON) into IEEE sections
function parseContent(content, title) {
    const result = {
        title: title || 'Untitled Paper',
        abstract: '',
        keywords: [],
        sections: [],
        references: []
    };

    if (!content) return result;

    let text = '';

    // Convert content to plain text
    if (typeof content === 'string') {
        text = content;
    } else if (typeof content === 'object') {
        // TipTap JSON format - extract text recursively
        const extractText = (node) => {
            if (!node) return '';
            if (node.text) return node.text;
            if (node.content) {
                return node.content.map(extractText).join('\n');
            }
            return '';
        };
        text = extractText(content);
    }

    // Parse sections using regex
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];

    // Pattern for section headers like "## I. INTRODUCTION" or "I. INTRODUCTION" or "## INTRODUCTION"
    const sectionPattern = /^(?:#{1,3}\s*)?(?:([IVXLC]+)\.\s*)?(.+)$/i;
    const abstractPattern = /^\*?\*?Abstract\*?\*?[—:\-]?\s*/i;
    const keywordsPattern = /^\*?\*?Keywords\*?\*?[—:\-]?\s*/i;
    const referencesPattern = /^\*?\*?(?:#{1,3}\s*)?(?:[IVXLC]+\.\s*)?References\*?\*?$/i;

    const knownSections = ['introduction', 'literature review', 'related work', 'methodology', 'methods',
        'results', 'discussion', 'results and discussion', 'conclusion', 'conclusions',
        'future work', 'acknowledgments', 'acknowledgements'];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            if (currentSection) {
                currentContent.push('');
            }
            continue;
        }

        // Check for Abstract
        if (abstractPattern.test(line)) {
            const abstractText = line.replace(abstractPattern, '');
            // Collect abstract content until next section
            let j = i + 1;
            let abstractLines = abstractText ? [abstractText] : [];
            while (j < lines.length) {
                const nextLine = lines[j].trim();
                if (nextLine.startsWith('#') || keywordsPattern.test(nextLine) ||
                    knownSections.some(s => nextLine.toLowerCase().includes(s))) {
                    break;
                }
                if (nextLine) abstractLines.push(nextLine);
                j++;
            }
            result.abstract = abstractLines.join(' ').trim();
            i = j - 1;
            continue;
        }

        // Check for Keywords
        if (keywordsPattern.test(line)) {
            const keywordsText = line.replace(keywordsPattern, '');
            result.keywords = keywordsText.split(/[,;]/).map(k => k.trim()).filter(k => k);
            continue;
        }

        // Check for References section
        if (referencesPattern.test(line)) {
            // Save current section
            if (currentSection) {
                result.sections.push({
                    title: currentSection,
                    content: currentContent.join('\n').trim()
                });
            }
            currentSection = null;

            // Collect references
            let j = i + 1;
            while (j < lines.length) {
                const refLine = lines[j].trim();
                if (refLine.match(/^\[?\d+\]?\s*/) || refLine.match(/^-\s*/)) {
                    result.references.push(refLine.replace(/^\[?\d+\]?\s*/, '').replace(/^-\s*/, ''));
                } else if (refLine) {
                    result.references.push(refLine);
                }
                j++;
            }
            break;
        }

        // Check for section headers
        if (line.startsWith('#') || line.match(/^[IVXLC]+\.\s+/i)) {
            // Save previous section
            if (currentSection) {
                result.sections.push({
                    title: currentSection,
                    content: currentContent.join('\n').trim()
                });
            }

            // Extract section title
            let sectionTitle = line.replace(/^#{1,3}\s*/, '').replace(/^[IVXLC]+\.\s*/i, '').trim();

            // Skip if it's the main title (usually first # heading)
            if (result.sections.length === 0 && !result.title && line.startsWith('# ')) {
                result.title = sectionTitle;
                currentSection = null;
                currentContent = [];
                continue;
            }

            currentSection = sectionTitle;
            currentContent = [];
            continue;
        }

        // Regular content line
        if (currentSection) {
            currentContent.push(line);
        } else if (!result.abstract && result.sections.length === 0) {
            // Content before any section - might be part of abstract or intro
            if (!result.abstract) {
                result.abstract += (result.abstract ? ' ' : '') + line;
            }
        }
    }

    // Save last section
    if (currentSection) {
        result.sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
        });
    }

    return result;
}

// Convert Roman numeral index
function toRoman(num) {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
        'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    return romanNumerals[num - 1] || num.toString();
}

export default function IEEEPreview({ document }) {
    const parsedContent = useMemo(() => {
        if (!document) return null;
        return parseContent(document.content, document.title);
    }, [document]);

    if (!parsedContent) return null;

    return (
        <div id="ieee-preview-content" className="font-serif text-[10pt] leading-tight text-black p-8">
            {/* Title Area */}
            <div className="text-center mb-6">
                <h1 className="text-[24pt] font-bold mb-4 leading-tight font-sans">{parsedContent.title}</h1>
                <div className="text-[11pt] italic mb-4">
                    <p>First Author<sup>1</sup>, Second Author<sup>2</sup>, Third Author<sup>3</sup></p>
                    <p className="text-[9pt] mt-1">
                        <sup>1</sup>Department of Computer Science, University Name, Country<br />
                        <sup>2</sup>Department of Engineering, University Name, Country
                    </p>
                    <p className="text-[9pt] mt-1">email@example.com</p>
                </div>
            </div>

            {/* Abstract */}
            {parsedContent.abstract && (
                <div className="mb-4 text-justify">
                    <span className="font-bold italic">Abstract</span>—
                    <span>{parsedContent.abstract}</span>
                </div>
            )}

            {/* Keywords */}
            {parsedContent.keywords.length > 0 && (
                <div className="mb-6 text-justify">
                    <span className="font-bold italic">Keywords</span>—
                    <span>{parsedContent.keywords.join(', ')}</span>
                </div>
            )}

            {/* Two Column Layout for Sections */}
            <div className="columns-2 gap-[0.25in] text-justify">
                {parsedContent.sections.map((section, index) => (
                    <section key={index} className="mb-4 break-inside-avoid">
                        <h2 className="text-[10pt] font-bold uppercase text-center mb-2 tracking-wide font-sans">
                            {toRoman(index + 1)}. {section.title.toUpperCase()}
                        </h2>
                        {section.content.split('\n\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="indent-[0.2in] mb-2">
                                {paragraph.split('\n').join(' ')}
                            </p>
                        ))}
                    </section>
                ))}

                {/* References */}
                {parsedContent.references.length > 0 && (
                    <section className="mb-4 break-inside-avoid">
                        <h2 className="text-[10pt] font-bold uppercase text-center mb-2 tracking-wide font-sans">References</h2>
                        <div className="text-[8pt] leading-normal">
                            {parsedContent.references.map((ref, index) => (
                                <div key={index} className="flex gap-1 mb-1">
                                    <span>[{index + 1}]</span>
                                    <span>{ref}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Fallback if no sections parsed */}
            {parsedContent.sections.length === 0 && !parsedContent.abstract && (
                <div className="columns-2 gap-[0.25in] text-justify">
                    <p className="text-[var(--muted-foreground)] italic text-center">
                        Paste or write content in the editor to see the IEEE preview.
                    </p>
                </div>
            )}
        </div>
    );
}
