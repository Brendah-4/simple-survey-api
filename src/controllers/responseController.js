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

    console.log('DEBUG total:', total, '| responses.length:', responses.length, '| responses:', JSON.stringify(responses));

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
