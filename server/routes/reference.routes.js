const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/reference.controller');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', referenceController.addReference);
router.get('/document/:documentId', referenceController.getReferences);
router.get('/lookup/:doi', referenceController.lookupDOI);
router.get('/search', referenceController.searchPapers);
router.put('/:id', referenceController.updateReference);
router.delete('/:id', referenceController.deleteReference);
router.post('/convert', referenceController.convertToIEEE);

module.exports = router;
