const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

exports.listResponses = async (req, res) => {
  try {
    const surveyId = req.params.surveyId || req.query.survey_id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));
    const email = req.query.email ? req.query.email.trim() : null;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    const params = [];

    if (surveyId) { conditions.push('r.survey_id = ?'); params.push(surveyId); }
    if (email) { conditions.push('ra_email.answer_text LIKE ?'); params.push(`%${email}%`); }

    const joinEmail = email
      ? 'JOIN response_answers ra_email ON ra_email.response_id = r.id JOIN questions q_email ON q_email.id = ra_email.question_id AND q_email.type = \'email\''
      : '';

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT r.id) as total FROM responses r ${joinEmail} ${where}`,
      params
    );

    const [responses] = await db.query(
      `SELECT DISTINCT r.* FROM responses r ${joinEmail} ${where} ORDER BY r.submitted_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    for (const resp of responses) {
      const [answers] = await db.query(
        `SELECT ra.*, q.title AS question_title, q.type AS question_type
         FROM response_answers ra JOIN questions q ON q.id = ra.question_id
         WHERE ra.response_id = ?`,
        [resp.id]
      );
      for (const ans of answers) {
        const [files] = await db.query(
          'SELECT id, original_name, mime_type FROM response_answer_files WHERE response_answer_id = ?',
          [ans.id]
        );
        ans.files = files;
      }
      resp.answers = answers;
    }

    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    res.xmlSuccess({
      meta: { current_page: page, last_page: lastPage, page_size: pageSize, total_count: total },
      responses,
    });
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
        'SELECT id, original_name, mime_type FROM response_answer_files WHERE response_answer_id = ?',
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
  const surveyId = req.params.surveyId || req.body.survey_id;
  if (!surveyId) return res.xmlError('survey_id is required');

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
      [surveyId, respondentUuid]
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

    const certificatePath = await generateCertificate(responseId, respondentUuid, surveyId);
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
