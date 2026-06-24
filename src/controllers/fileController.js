const db = require('../config/db');

exports.downloadCertificate = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT certificate_path FROM responses WHERE id = ?', [req.params.responseId]);
    if (!rows.length) return res.xmlError('Response not found', 404);
    if (!rows[0].certificate_path) return res.xmlError('Certificate not available', 404);
    res.redirect(rows[0].certificate_path);
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.downloadCertificateById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT file_url, original_name, mime_type FROM response_answer_files WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.xmlError('Certificate not found', 404);
    res.redirect(rows[0].file_url);
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.downloadUploadedFile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT file_url, original_name, mime_type FROM response_answer_files WHERE id = ?',
      [req.params.fileId]
    );
    if (!rows.length) return res.xmlError('File not found', 404);
    res.redirect(rows[0].file_url);
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};