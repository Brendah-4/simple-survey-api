const router = require('express').Router();
const ctrl = require('../controllers/questionController');

router.get('/', ctrl.listQuestions);
router.get('/:id', ctrl.getQuestion);
router.post('/', ctrl.createQuestion);
router.put('/:id', ctrl.updateQuestion);
router.delete('/:id', ctrl.deleteQuestion);

module.exports = router;
