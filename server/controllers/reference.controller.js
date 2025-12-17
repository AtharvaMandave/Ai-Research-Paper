const Reference = require('../models/Reference');
const Document = require('../models/Document');
const axios = require('axios');

// Add reference
exports.addReference = async (req, res) => {
    try {
        const { documentId, doi, title, authors, year, journal, volume, issue, pages, rawText } = req.body;

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Get next citation number
        const existingRefs = await Reference.countDocuments({ document: documentId });
        const citationNumber = existingRefs + 1;

        const reference = new Reference({
            document: documentId,
            citationNumber,
            doi,
            title,
            authors: authors || [],
            year,
            journal,
            volume,
            issue,
            pages,
            rawText
        });

        // Generate IEEE format
        reference.formattedIEEE = reference.toIEEEFormat();
        await reference.save();

        // Add to document
        document.references.push(reference._id);
        await document.save();

        res.status(201).json(reference);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lookup DOI from Semantic Scholar
exports.lookupDOI = async (req, res) => {
    try {
        const { doi } = req.params;

        const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}`, {
            params: {
                fields: 'title,authors,year,venue,publicationVenue,externalIds'
            },
            headers: {
                'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
            }
        });

        const paper = response.data;

        res.json({
            doi,
            title: paper.title,
            authors: paper.authors?.map(a => a.name) || [],
            year: paper.year,
            journal: paper.venue || paper.publicationVenue?.name,
            externalIds: paper.externalIds
        });
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'DOI not found' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Search papers
exports.searchPapers = async (req, res) => {
    try {
        const { query, limit = 10 } = req.query;

        const response = await axios.get('https://api.semanticscholar.org/graph/v1/paper/search', {
            params: {
                query,
                limit,
                fields: 'title,authors,year,venue,externalIds,abstract'
            },
            headers: {
                'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get references for document
exports.getReferences = async (req, res) => {
    try {
        const references = await Reference.find({ document: req.params.documentId })
            .sort({ citationNumber: 1 });
        res.json(references);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update reference
exports.updateReference = async (req, res) => {
    try {
        const reference = await Reference.findById(req.params.id);
        if (!reference) {
            return res.status(404).json({ error: 'Reference not found' });
        }

        const updates = ['title', 'authors', 'year', 'journal', 'volume', 'issue', 'pages', 'doi', 'url'];
        updates.forEach(field => {
            if (req.body[field] !== undefined) {
                reference[field] = req.body[field];
            }
        });

        // Regenerate IEEE format
        reference.formattedIEEE = reference.toIEEEFormat();
        await reference.save();

        res.json(reference);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete reference
exports.deleteReference = async (req, res) => {
    try {
        const reference = await Reference.findById(req.params.id);
        if (!reference) {
            return res.status(404).json({ error: 'Reference not found' });
        }

        // Remove from document
        await Document.findByIdAndUpdate(reference.document, {
            $pull: { references: reference._id }
        });

        // Renumber remaining references
        await Reference.updateMany(
            { document: reference.document, citationNumber: { $gt: reference.citationNumber } },
            { $inc: { citationNumber: -1 } }
        );

        await reference.deleteOne();
        res.json({ message: 'Reference deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Convert citation format to IEEE
exports.convertToIEEE = async (req, res) => {
    try {
        const { citation, format } = req.body;

        // This would ideally use AI for more accurate parsing
        // For now, we'll send to AI engine
        const response = await axios.post(`${process.env.AI_ENGINE_URL}/convert-citation`, {
            citation,
            sourceFormat: format,
            targetFormat: 'IEEE'
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
