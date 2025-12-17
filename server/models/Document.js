const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['title', 'abstract', 'keywords', 'introduction', 'literature_review',
            'problem_statement', 'methodology', 'experimental_setup', 'results',
            'discussion', 'conclusion', 'future_scope', 'references', 'custom'],
        required: true
    },
    title: String,
    content: String,
    order: Number
});

const versionSchema = new mongoose.Schema({
    version: Number,
    label: String,
    content: Object,
    sections: [sectionSchema],
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Untitled Research Paper'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'editor' },
        addedAt: { type: Date, default: Date.now }
    }],
    domain: {
        type: String,
        enum: ['AI', 'IoT', 'Cybersecurity', 'Healthcare', 'DataScience',
            'MachineLearning', 'CloudComputing', 'Blockchain', 'Other'],
        default: 'Other'
    },
    keywords: [String],
    content: {
        type: Object,  // TipTap JSON content
        default: {}
    },
    sections: [sectionSchema],
    versions: [versionSchema],
    currentVersion: {
        type: Number,
        default: 1
    },
    references: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reference'
    }],
    metadata: {
        wordCount: { type: Number, default: 0 },
        characterCount: { type: Number, default: 0 },
        plagiarismScore: { type: Number, default: 0 },
        grammarScore: { type: Number, default: 100 },
        aiContentScore: { type: Number, default: 0 },
        lastAnalyzed: Date
    },
    status: {
        type: String,
        enum: ['draft', 'in_progress', 'review', 'completed'],
        default: 'draft'
    },
    generatedFrom: {
        type: String,
        enum: ['manual', 'ai_generated', 'imported'],
        default: 'manual'
    }
}, { timestamps: true });

// Index for search
documentSchema.index({ title: 'text', 'sections.content': 'text' });

module.exports = mongoose.model('Document', documentSchema);
