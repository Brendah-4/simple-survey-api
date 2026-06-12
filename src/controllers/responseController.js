const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

exports.listResponses = async (req, res) => {
  try {
    const surveyId = req.query.survey_id;
    let query = `
      SELECT r.*, s.title AS survey_title
      FROM responses r
      JOIN surveys s ON s.id = r.survey_id
    `;
    const params = [];
    if (surveyId) { query += ' WHERE r.survey_id = ?'; params.push(surveyId); }
    query += ' ORDER BY r.submitted_at DESC';

    const [responses] = await db.query(query, params);

    for (const resp of responses) {
      const [answers] = await db.query(
        `SELECT ra.*, q.title AS question_title, q.type AS question_type
         FROM response_answers ra JOIN questions q ON q.id = ra.question_id
         WHERE ra.response_id = ?`,
        [resp.id]
      );
      for (const ans of answers) {
        const [files] = await db.query(
          'SELECT id, original_name, mime_type, file_path FROM response_answer_files WHERE response_answer_id = ?',
          [ans.id]
        );
        ans.files = files;
      }
      resp.answers = answers;
    }

    res.xmlSuccess({ responses });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.getResponse = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT r.*, s.title AS survey_title FROM responses r JOIN surveys s ON s.id = r.survey_id WHERE r.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.xmlError('Response not found', 404);
    const resp = rows[0];

    const [answers] = await db.query(
      `SELECT ra.*, q.title AS question_title, q.type AS question_type
       FROM response_answers ra JOIN questions q ON q.id = ra.question_id
       WHERE ra.response_id = ?`,
      [resp.id]
    );
    for (const ans of answers) {
      const [files] = await db.query(
        'SELECT id, original_name, mime_type, file_path FROM response_answer_files WHERE response_answer_id = ?',
        [ans.id]
      );
      ans.files = files;
    }
    resp.answers = answers;

    res.xmlSuccess({ response: resp });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.submitResponse = async (req, res) => {
  const { survey_id } = req.body;
  if (!survey_id) return res.xmlError('survey_id is required');

  let parsedAnswers;
  try {
    const raw = req.body.answers;
    parsedAnswers = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return res.xmlError('answers must be valid JSON');
  }
  if (!Array.isArray(parsedAnswers)) return res.xmlError('answers must be an array');
  const respondentUuid = uuidv4();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO responses (survey_id, respondent_uuid) VALUES (?, ?)',
      [survey_id, respondentUuid]
    );
    const responseId = result.insertId;

    const uploadedFiles = req.files || [];
    const filesByField = {};
    uploadedFiles.forEach((f) => {
      if (!filesByField[f.fieldname]) filesByField[f.fieldname] = [];
      filesByField[f.fieldname].push(f);
    });

    for (const ans of parsedAnswers) {
      const { question_id, answer_text } = ans;
      const [ansResult] = await conn.query(
        'INSERT INTO response_answers (response_id, question_id, answer_text) VALUES (?, ?, ?)',
        [responseId, question_id, answer_text || null]
      );
      const ansId = ansResult.insertId;

      const fieldName = `file_${question_id}`;
      if (filesByField[fieldName]) {
        for (const file of filesByField[fieldName]) {
          await conn.query(
            'INSERT INTO response_answer_files (response_answer_id, file_path, original_name, mime_type) VALUES (?, ?, ?, ?)',
            [ansId, file.path, file.originalname, file.mimetype]
          );
        }
      }
    }

    const certificatePath = await generateCertificate(responseId, respondentUuid, survey_id);
    await conn.query('UPDATE responses SET certificate_path = ? WHERE id = ?', [certificatePath, responseId]);

    await conn.commit();
    conn.release();

    res.xmlSuccess({ response_id: responseId, respondent_uuid: respondentUuid, certificate_path: certificatePath }, 201);
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.xmlError(err.message, 500);
  }
};

async function generateCertificate(responseId, uuid, surveyId) {
  const dir = path.join(process.env.UPLOAD_DIR || 'uploads', 'certificates');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `certificate_${responseId}_${uuid}.txt`;
  const filePath = path.join(dir, filename);
  const content = `Survey Completion Certificate\nSurvey ID: ${surveyId}\nResponse ID: ${responseId}\nUUID: ${uuid}\nDate: ${new Date().toISOString()}`;
  fs.writeFileSync(filePath, content);
  return filePath;
}
