const router = require('express').Router();
const ctrl = require('../controllers/surveyController');
const questionCtrl = require('../controllers/questionController');
const responseCtrl = require('../controllers/responseController');
const upload = require('../middleware/upload');

router.get('/', ctrl.listSurveys);
router.get('/:id', ctrl.getSurvey);
router.post('/', ctrl.createSurvey);
router.put('/:id', ctrl.updateSurvey);
router.delete('/:id', ctrl.deleteSurvey);

// Nested: /api/surveys/:surveyId/questions
router.get('/:surveyId/questions', questionCtrl.listQuestions);
router.post('/:surveyId/questions', questionCtrl.createQuestion);

// Nested: /api/surveys/:surveyId/responses
router.get('/:surveyId/responses', responseCtrl.listResponses);
router.post('/:surveyId/responses', upload.any(), responseCtrl.submitResponse);

module.exports = router;
