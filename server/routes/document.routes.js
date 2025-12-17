const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.post('/', documentController.createDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Version management
router.post('/:id/versions', documentController.saveVersion);
router.get('/:id/versions', documentController.getVersions);
router.post('/:id/versions/restore', documentController.restoreVersion);

// Collaboration
router.post('/:id/collaborators', documentController.addCollaborator);

module.exports = router;
