const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { auth } = require('../middleware/auth');

router.use(auth);

// Paper generation
router.post('/generate-paper', aiController.generatePaper);

// Text improvement
router.post('/improve-text', aiController.improveText);

// Content analysis
router.post('/analyze-content', aiController.analyzeContent);

// Plagiarism
router.post('/check-plagiarism', aiController.checkPlagiarism);
router.post('/fix-plagiarism', aiController.fixPlagiarism);

// Suggestions
router.post('/suggestions', aiController.getSuggestions);

// Generate sections
router.post('/generate-literature-review', aiController.generateLiteratureReview);
router.post('/generate-abstract', aiController.generateAbstract);

// Validation
router.post('/check-grammar', aiController.checkGrammar);
router.post('/detect-ai-content', aiController.detectAIContent);

// Rewrite & Humanize
router.post('/rewrite-text', aiController.rewriteText);
router.post('/humanize-text', aiController.humanizeText);

module.exports = router;
