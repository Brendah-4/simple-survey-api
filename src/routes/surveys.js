const router = require('express').Router();
const ctrl = require('../controllers/surveyController');

router.get('/', ctrl.listSurveys);
router.get('/:id', ctrl.getSurvey);
router.post('/', ctrl.createSurvey);
router.put('/:id', ctrl.updateSurvey);
router.delete('/:id', ctrl.deleteSurvey);

module.exports = router;
