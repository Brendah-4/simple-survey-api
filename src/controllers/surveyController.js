const db = require('../config/db');

exports.listSurveys = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM surveys ORDER BY created_at DESC');
    res.xmlSuccess({ surveys: rows });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.getSurvey = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM surveys WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.xmlError('Survey not found', 404);
    res.xmlSuccess({ survey: rows[0] });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.createSurvey = async (req, res) => {
  const { title, description, status } = req.body;
  if (!title) return res.xmlError('Title is required');

  try {
    const [result] = await db.query(
      'INSERT INTO surveys (title, description, status) VALUES (?, ?, ?)',
      [title, description || null, status || 'draft']
    );
    const [rows] = await db.query('SELECT * FROM surveys WHERE id = ?', [result.insertId]);
    res.xmlSuccess({ survey: rows[0] }, 201);
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.updateSurvey = async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM surveys WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.xmlError('Survey not found', 404);

    await db.query(
      'UPDATE surveys SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ?',
      [title || null, description || null, status || null, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM surveys WHERE id = ?', [req.params.id]);
    res.xmlSuccess({ survey: rows[0] });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM surveys WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.xmlError('Survey not found', 404);

    await db.query('DELETE FROM surveys WHERE id = ?', [req.params.id]);
    res.xmlSuccess({ message: 'Survey deleted' });
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};
