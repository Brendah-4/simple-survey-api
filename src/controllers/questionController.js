const db = require('../config/db');

exports.listQuestions = async (req, res) => {
  try {
    const surveyId = req.params.surveyId || req.query.survey_id;
    let query = `
      SELECT q.*,
        GROUP_CONCAT(DISTINCT CONCAT(qo.id,':',qo.label,':',qo.value,':',qo.sort_order) ORDER BY qo.sort_order SEPARATOR '|') AS options_raw,
        qcc.min_selections, qcc.max_selections, qcc.allow_other,
        qfc.allowed_types, qfc.max_size_mb, qfc.max_files
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id = q.id
      LEFT JOIN question_choice_config qcc ON qcc.question_id = q.id
      LEFT JOIN question_file_config qfc ON qfc.question_id = q.id
    `;
    const params = [];
    if (surveyId) {
      query += ' WHERE q.survey_id = ?';
      params.push(surveyId);
    }
    query += ' GROUP BY q.id ORDER BY q.sort_order ASC';

    const [rows] = await db.query(query, params);
    const questions = rows.map(parseQuestion);
    res.xmlSuccess({ questions });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.*,
        GROUP_CONCAT(DISTINCT CONCAT(qo.id,':',qo.label,':',qo.value,':',qo.sort_order) ORDER BY qo.sort_order SEPARATOR '|') AS options_raw,
        qcc.min_selections, qcc.max_selections, qcc.allow_other,
        qfc.allowed_types, qfc.max_size_mb, qfc.max_files
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id = q.id
      LEFT JOIN question_choice_config qcc ON qcc.question_id = q.id
      LEFT JOIN question_file_config qfc ON qfc.question_id = q.id
      WHERE q.id = ?
      GROUP BY q.id`,
      [req.params.id]
    );
    if (!rows.length) return res.xmlError('Question not found', 404);
    res.xmlSuccess({ question: parseQuestion(rows[0]) });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.createQuestion = async (req, res) => {
  const surveyId = req.params.surveyId || req.body.survey_id;
  const { type, title, description, required, sort_order } = req.body;
  if (!surveyId || !type || !title) return res.xmlError('survey_id, type, and title are required');

  const options = parseBodyJson(req.body.options);
  const choice_config = parseBodyJson(req.body.choice_config);
  const file_config = parseBodyJson(req.body.file_config);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO questions (survey_id, type, title, description, required, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [surveyId, type, title, description || null, required ? 1 : 0, sort_order || 0]
    );
    const questionId = result.insertId;

    if (options && Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        const { label, value } = options[i];
        await conn.query(
          'INSERT INTO question_options (question_id, label, value, sort_order) VALUES (?, ?, ?, ?)',
          [questionId, label, value, i]
        );
      }
    }

    if (choice_config && ['multiple_choice', 'checkbox'].includes(type)) {
      await conn.query(
        'INSERT INTO question_choice_config (question_id, min_selections, max_selections, allow_other) VALUES (?, ?, ?, ?)',
        [questionId, choice_config.min_selections || 1, choice_config.max_selections || null, choice_config.allow_other ? 1 : 0]
      );
    }

    if (file_config && type === 'file') {
      await conn.query(
        'INSERT INTO question_file_config (question_id, allowed_types, max_size_mb, max_files) VALUES (?, ?, ?, ?)',
        [questionId, file_config.allowed_types || 'image/jpeg,image/png,application/pdf', file_config.max_size_mb || 5, file_config.max_files || 1]
      );
    }

    await conn.commit();
    conn.release();

    const [rows] = await db.query(
      `SELECT q.*,
        GROUP_CONCAT(DISTINCT CONCAT(qo.id,':',qo.label,':',qo.value,':',qo.sort_order) ORDER BY qo.sort_order SEPARATOR '|') AS options_raw,
        qcc.min_selections, qcc.max_selections, qcc.allow_other,
        qfc.allowed_types, qfc.max_size_mb, qfc.max_files
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id = q.id
      LEFT JOIN question_choice_config qcc ON qcc.question_id = q.id
      LEFT JOIN question_file_config qfc ON qfc.question_id = q.id
      WHERE q.id = ? GROUP BY q.id`,
      [questionId]
    );
    res.xmlSuccess({ question: parseQuestion(rows[0]) }, 201);
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.xmlError(err.message, 500);
  }
};

exports.updateQuestion = async (req, res) => {
  const { title, description, required, sort_order } = req.body;
  const options = parseBodyJson(req.body.options);
  const choice_config = parseBodyJson(req.body.choice_config);
  const file_config = parseBodyJson(req.body.file_config);
  const conn = await db.getConnection();
  try {
    const [existing] = await conn.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (!existing.length) { conn.release(); return res.xmlError('Question not found', 404); }

    await conn.beginTransaction();

    await conn.query(
      'UPDATE questions SET title = COALESCE(?, title), description = COALESCE(?, description), required = COALESCE(?, required), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [title || null, description || null, required != null ? (required ? 1 : 0) : null, sort_order ?? null, req.params.id]
    );

    if (options && Array.isArray(options)) {
      await conn.query('DELETE FROM question_options WHERE question_id = ?', [req.params.id]);
      for (let i = 0; i < options.length; i++) {
        const { label, value } = options[i];
        await conn.query(
          'INSERT INTO question_options (question_id, label, value, sort_order) VALUES (?, ?, ?, ?)',
          [req.params.id, label, value, i]
        );
      }
    }

    if (choice_config) {
      await conn.query(
        `INSERT INTO question_choice_config (question_id, min_selections, max_selections, allow_other) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE min_selections = VALUES(min_selections), max_selections = VALUES(max_selections), allow_other = VALUES(allow_other)`,
        [req.params.id, choice_config.min_selections || 1, choice_config.max_selections || null, choice_config.allow_other ? 1 : 0]
      );
    }

    if (file_config) {
      await conn.query(
        `INSERT INTO question_file_config (question_id, allowed_types, max_size_mb, max_files) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE allowed_types = VALUES(allowed_types), max_size_mb = VALUES(max_size_mb), max_files = VALUES(max_files)`,
        [req.params.id, file_config.allowed_types || 'image/jpeg,image/png,application/pdf', file_config.max_size_mb || 5, file_config.max_files || 1]
      );
    }

    await conn.commit();
    conn.release();

    const [rows] = await db.query(
      `SELECT q.*,
        GROUP_CONCAT(DISTINCT CONCAT(qo.id,':',qo.label,':',qo.value,':',qo.sort_order) ORDER BY qo.sort_order SEPARATOR '|') AS options_raw,
        qcc.min_selections, qcc.max_selections, qcc.allow_other,
        qfc.allowed_types, qfc.max_size_mb, qfc.max_files
      FROM questions q
      LEFT JOIN question_options qo ON qo.question_id = q.id
      LEFT JOIN question_choice_config qcc ON qcc.question_id = q.id
      LEFT JOIN question_file_config qfc ON qfc.question_id = q.id
      WHERE q.id = ? GROUP BY q.id`,
      [req.params.id]
    );
    res.xmlSuccess({ question: parseQuestion(rows[0]) });
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.xmlError(err.message, 500);
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM questions WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.xmlError('Question not found', 404);
    await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.xmlSuccess({ message: 'Question deleted' });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

function parseBodyJson(val) {
  if (!val) return null;
  if (Array.isArray(val) || typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return null; }
}

function parseQuestion(row) {
  const q = { ...row };
  delete q.options_raw;

  q.options = [];
  if (row.options_raw) {
    q.options = row.options_raw.split('|').map((part) => {
      const [id, label, value, sort_order] = part.split(':');
      return { id, label, value, sort_order };
    });
  }

  q.choice_config = null;
  if (row.min_selections != null) {
    q.choice_config = {
      min_selections: row.min_selections,
      max_selections: row.max_selections,
      allow_other: row.allow_other,
    };
  }
  delete q.min_selections; delete q.max_selections; delete q.allow_other;

  q.file_config = null;
  if (row.allowed_types != null) {
    q.file_config = {
      allowed_types: row.allowed_types,
      max_size_mb: row.max_size_mb,
      max_files: row.max_files,
    };
  }
  delete q.allowed_types; delete q.max_size_mb; delete q.max_files;

  return q;
}
