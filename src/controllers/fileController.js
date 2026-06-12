const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.downloadCertificate = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT certificate_path FROM responses WHERE id = ?', [req.params.responseId]);
    if (!rows.length) return res.xmlError('Response not found', 404);
    if (!rows[0].certificate_path) return res.xmlError('Certificate not available', 404);

    const filePath = rows[0].certificate_path;
    if (!fs.existsSync(filePath)) return res.xmlError('Certificate file missing', 404);

    res.download(filePath, path.basename(filePath));
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};

exports.downloadUploadedFile = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT file_path, original_name, mime_type FROM response_answer_files WHERE id = ?', [req.params.fileId]);
    if (!rows.length) return res.xmlError('File not found', 404);

    const { file_path, original_name, mime_type } = rows[0];
    if (!fs.existsSync(file_path)) return res.xmlError('File missing on server', 404);

    res.setHeader('Content-Type', mime_type || 'application/octet-stream');
    res.download(file_path, original_name);
  } catch (err) {
    res.xmlError(err.message, 500);
  }
};
