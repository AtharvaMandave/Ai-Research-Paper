const Document = require('../models/Document');
const Reference = require('../models/Reference');

// Create document
exports.createDocument = async (req, res) => {
    try {
        const { title, domain, keywords } = req.body;

        const document = new Document({
            title: title || 'Untitled Research Paper',
            owner: req.user._id,
            domain,
            keywords: keywords || []
        });

        await document.save();

        // Add to user's documents
        req.user.documents.push(document._id);
        await req.user.save();

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all documents for user
exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            $or: [
                { owner: req.user._id },
                { 'collaborators.user': req.user._id }
            ]
        }).populate('owner', 'name email avatar').sort({ updatedAt: -1 });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single document
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('collaborators.user', 'name email avatar')
            .populate('references');

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check access
        const hasAccess = document.owner._id.equals(req.user._id) ||
            document.collaborators.some(c => c.user._id.equals(req.user._id));

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update document
exports.updateDocument = async (req, res) => {
    try {
        const { title, content, sections, domain, keywords, status } = req.body;

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check edit access
        const hasEditAccess = document.owner.equals(req.user._id) ||
            document.collaborators.some(c =>
                c.user.equals(req.user._id) && ['editor', 'admin'].includes(c.role)
            );

        if (!hasEditAccess) {
            return res.status(403).json({ error: 'Edit access denied' });
        }

        // Update fields
        if (title) document.title = title;
        if (content) document.content = content;
        if (sections) document.sections = sections;
        if (domain) document.domain = domain;
        if (keywords) document.keywords = keywords;
        if (status) document.status = status;

        // Update word count
        if (content) {
            const textContent = JSON.stringify(content);
            document.metadata.characterCount = textContent.length;
            document.metadata.wordCount = textContent.split(/\s+/).filter(w => w).length;
        }

        await document.save();
        res.json(document);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save version
exports.saveVersion = async (req, res) => {
    try {
        const { label } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const version = {
            version: document.currentVersion,
            label: label || `Version ${document.currentVersion}`,
            content: document.content,
            sections: document.sections,
            createdBy: req.user._id
        };

        document.versions.push(version);
        document.currentVersion += 1;
        await document.save();

        res.json({ message: 'Version saved', version });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get version history
exports.getVersions = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .select('versions currentVersion')
            .populate('versions.createdBy', 'name email');

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json(document.versions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Restore version
exports.restoreVersion = async (req, res) => {
    try {
        const { versionNumber } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const version = document.versions.find(v => v.version === versionNumber);
        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // Save current as new version before restoring
        document.versions.push({
            version: document.currentVersion,
            label: `Before restore to V${versionNumber}`,
            content: document.content,
            sections: document.sections,
            createdBy: req.user._id
        });

        document.content = version.content;
        document.sections = version.sections;
        document.currentVersion += 1;
        await document.save();

        res.json({ message: 'Version restored', document });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add collaborator
exports.addCollaborator = async (req, res) => {
    try {
        const { email, role } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        if (!document.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can add collaborators' });
        }

        const User = require('../models/User');
        const collaborator = await User.findOne({ email });

        if (!collaborator) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already a collaborator
        const existing = document.collaborators.find(c => c.user.equals(collaborator._id));
        if (existing) {
            existing.role = role || 'editor';
        } else {
            document.collaborators.push({
                user: collaborator._id,
                role: role || 'editor'
            });
        }

        await document.save();
        res.json({ message: 'Collaborator added', document });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete document
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        if (!document.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only owner can delete document' });
        }

        // Delete associated references
        await Reference.deleteMany({ document: document._id });

        await document.deleteOne();
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
