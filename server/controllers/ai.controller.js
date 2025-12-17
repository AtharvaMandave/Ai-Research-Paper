const axios = require('axios');
const Document = require('../models/Document');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Generate full research paper
exports.generatePaper = async (req, res) => {
    try {
        const { topic, keywords, domain, length } = req.body;

        try {
            const response = await axios.post(`${AI_ENGINE_URL}/generate-paper`, {
                topic,
                keywords: keywords || [],
                domain: domain || 'Other',
                length: length || 'medium',
                includeImages: false
            }, { timeout: 120000 });

            res.status(201).json({
                message: 'Paper generated successfully',
                ...response.data
            });
        } catch (aiError) {
            // Fallback: Return mock generated paper when AI engine is unavailable
            console.log('AI Engine unavailable, using mock response');

            const mockPaper = {
                title: `Research on ${topic}`,
                rawContent: `# ${topic}\n\n## Abstract\n\nThis research paper explores ${topic} in the context of ${domain}. The study investigates key aspects and provides insights into current developments and future directions.\n\n**Keywords:** ${keywords?.join(', ') || 'research, innovation, technology'}\n\n## I. INTRODUCTION\n\nThe field of ${domain} has witnessed significant advancements in recent years. This paper focuses on ${topic}, examining its implications and applications.\n\n## II. LITERATURE REVIEW\n\nPrevious studies have established foundational knowledge in this area [1][2]. Recent developments have expanded our understanding of ${topic}.\n\n## III. METHODOLOGY\n\nOur research approach involves comprehensive analysis and systematic evaluation of ${topic} within the ${domain} domain.\n\n## IV. RESULTS AND DISCUSSION\n\nThe findings demonstrate significant insights into ${topic}. Key observations include:\n- Enhanced understanding of core concepts\n- Practical applications in ${domain}\n- Future research directions\n\n## V. CONCLUSION\n\nThis research contributes to the field of ${domain} by providing comprehensive analysis of ${topic}. Future work should explore additional dimensions and applications.\n\n## REFERENCES\n\n[1] Author, A., "Title of Paper," Journal Name, vol. 1, no. 1, pp. 1-10, 2024.\n[2] Author, B., "Another Paper," Conference Name, 2024.`,
                keywords: keywords || ['research', 'innovation', domain],
                sections: [
                    { type: 'abstract', title: 'Abstract', content: `This research paper explores ${topic}...` },
                    { type: 'introduction', title: 'Introduction', content: `The field of ${domain}...` },
                    { type: 'methodology', title: 'Methodology', content: 'Our research approach...' },
                    { type: 'results', title: 'Results', content: 'The findings demonstrate...' },
                    { type: 'conclusion', title: 'Conclusion', content: 'This research contributes...' }
                ]
            };

            res.status(201).json({
                message: 'Paper generated successfully (Demo Mode - AI Engine Offline)',
                ...mockPaper
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Improve/rewrite text
exports.improveText = async (req, res) => {
    try {
        const { text, action } = req.body;
        // Actions: 'grammar', 'academic_tone', 'remove_plagiarism', 'expand', 'summarize', 'professional'

        const response = await axios.post(`${AI_ENGINE_URL}/improve-text`, {
            text,
            action
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Analyze and restructure content
exports.analyzeContent = async (req, res) => {
    try {
        const { content, format } = req.body;
        // format: 'text', 'docx', 'pdf'

        const response = await axios.post(`${AI_ENGINE_URL}/analyze-content`, {
            content,
            format
        });

        res.json({
            detectedSections: response.data.sections,
            missingSections: response.data.missingSections,
            suggestions: response.data.suggestions,
            restructured: response.data.restructured
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check plagiarism
exports.checkPlagiarism = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/check-plagiarism`, {
            text
        });

        res.json({
            score: response.data.score,
            plagiarismScore: response.data.score,
            flaggedSentences: response.data.flaggedSentences,
            suggestions: response.data.suggestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fix plagiarism
exports.fixPlagiarism = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/fix-plagiarism`, {
            text
        });

        res.json({
            originalText: text,
            rewrittenText: response.data.rewritten,
            similarityReduction: response.data.similarityReduction
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get AI suggestions for text
exports.getSuggestions = async (req, res) => {
    try {
        const { text, context } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/get-suggestions`, {
            text,
            context
        });

        res.json({
            suggestions: response.data.suggestions,
            improvements: response.data.improvements,
            missingCitations: response.data.missingCitations
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate literature review
exports.generateLiteratureReview = async (req, res) => {
    try {
        const { topic, papers } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/generate-literature-review`, {
            topic,
            papers
        });

        res.json({
            literatureReview: response.data.content,
            citations: response.data.citations
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate abstract
exports.generateAbstract = async (req, res) => {
    try {
        const { content, maxWords } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/generate-abstract`, {
            content,
            maxWords: maxWords || 250
        });

        res.json({
            abstract: response.data.abstract
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check grammar
exports.checkGrammar = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/check-grammar`, {
            text
        });

        res.json({
            score: response.data.score,
            errors: response.data.errors,
            corrections: response.data.corrections
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Detect AI-generated content
exports.detectAIContent = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/detect-ai-content`, {
            text
        });

        // Pass through the full response from AI engine
        res.json({
            score: response.data.score,
            confidence: response.data.confidence,
            analysis: response.data.analysis,
            // Also include legacy field names for compatibility
            aiScore: response.data.score,
            humanLikelihood: 100 - response.data.score
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Rewrite text for plagiarism
exports.rewriteText = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/rewrite-text`, {
            text
        });

        res.json({
            rewrittenText: response.data.rewrittenText,
            originalLength: response.data.originalLength,
            rewrittenLength: response.data.rewrittenLength
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Humanize AI text
exports.humanizeText = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(`${AI_ENGINE_URL}/humanize-text`, {
            text
        });

        res.json({
            humanizedText: response.data.humanizedText,
            originalLength: response.data.originalLength,
            humanizedLength: response.data.humanizedLength
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
