import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('arps_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Documents API
export const documentsAPI = {
    getAll: () => api.get('/documents'),
    getOne: (id) => api.get(`/documents/${id}`),
    create: (data) => api.post('/documents', data),
    update: (id, data) => api.put(`/documents/${id}`, data),
    delete: (id) => api.delete(`/documents/${id}`),
    saveVersion: (id, label) => api.post(`/documents/${id}/versions`, { label }),
    getVersions: (id) => api.get(`/documents/${id}/versions`),
    restoreVersion: (id, versionNumber) => api.post(`/documents/${id}/versions/restore`, { versionNumber }),
    addCollaborator: (id, email, role) => api.post(`/documents/${id}/collaborators`, { email, role })
};

// References API
export const referencesAPI = {
    getAll: (documentId) => api.get(`/references/document/${documentId}`),
    add: (data) => api.post('/references', data),
    update: (id, data) => api.put(`/references/${id}`, data),
    delete: (id) => api.delete(`/references/${id}`),
    lookupDOI: (doi) => api.get(`/references/lookup/${encodeURIComponent(doi)}`),
    searchPapers: (query) => api.get('/references/search', { params: { query } }),
    convertToIEEE: (citation, format) => api.post('/references/convert', { citation, format })
};

// AI API
export const aiAPI = {
    generatePaper: (data) => api.post('/ai/generate-paper', data),
    improveText: (text, action) => api.post('/ai/improve-text', { text, action }),
    analyzeContent: (content, format) => api.post('/ai/analyze-content', { content, format }),

    // Plagiarism checking
    checkPlagiarism: (text) => api.post('/ai/check-plagiarism', { text }),
    fixPlagiarism: (text) => api.post('/ai/fix-plagiarism', { text }),
    rewriteText: (text) => api.post('/ai/rewrite-text', { text }),

    // AI Detection & Humanization
    detectAI: (text) => api.post('/ai/detect-ai-content', { text }),
    detectAIContent: (text) => api.post('/ai/detect-ai-content', { text }),
    humanizeText: (text) => api.post('/ai/humanize-text', { text }),

    // Other AI features
    getSuggestions: (text, context) => api.post('/ai/suggestions', { text, context }),
    generateLiteratureReview: (topic, papers) => api.post('/ai/generate-literature-review', { topic, papers }),
    generateAbstract: (content, maxWords) => api.post('/ai/generate-abstract', { content, maxWords }),
    checkGrammar: (text) => api.post('/ai/check-grammar', { text })
};

export default api;
