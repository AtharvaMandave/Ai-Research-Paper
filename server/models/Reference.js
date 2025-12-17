const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    citationNumber: {
        type: Number,
        required: true
    },
    doi: String,
    title: {
        type: String,
        required: true
    },
    authors: [String],
    year: Number,
    journal: String,
    volume: String,
    issue: String,
    pages: String,
    publisher: String,
    url: String,
    rawText: String,
    formattedIEEE: String,
    originalFormat: {
        type: String,
        enum: ['APA', 'MLA', 'Harvard', 'Chicago', 'IEEE', 'Unknown'],
        default: 'Unknown'
    },
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Method to format as IEEE
referenceSchema.methods.toIEEEFormat = function () {
    const authors = this.authors.length > 0
        ? this.authors.map((a, i) => {
            if (i === this.authors.length - 1 && this.authors.length > 1) {
                return 'and ' + a;
            }
            return a;
        }).join(', ')
        : 'Unknown Author';

    let citation = `[${this.citationNumber}] ${authors}, "${this.title}"`;

    if (this.journal) {
        citation += `, ${this.journal}`;
    }
    if (this.volume) {
        citation += `, vol. ${this.volume}`;
    }
    if (this.issue) {
        citation += `, no. ${this.issue}`;
    }
    if (this.pages) {
        citation += `, pp. ${this.pages}`;
    }
    if (this.year) {
        citation += `, ${this.year}`;
    }
    citation += '.';

    if (this.doi) {
        citation += ` doi: ${this.doi}`;
    }

    return citation;
};

module.exports = mongoose.model('Reference', referenceSchema);
