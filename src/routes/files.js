const router = require('express').Router();
const ctrl = require('../controllers/fileController');

router.get('/certificate/:responseId', ctrl.downloadCertificate);
router.get('/upload/:fileId', ctrl.downloadUploadedFile);

module.exports = router;
