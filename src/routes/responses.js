const router = require('express').Router();
const ctrl = require('../controllers/responseController');
const upload = require('../middleware/upload');

router.get('/', ctrl.listResponses);
router.get('/:id', ctrl.getResponse);
router.post('/', upload.any(), ctrl.submitResponse);

module.exports = router;
