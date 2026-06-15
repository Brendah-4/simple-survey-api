require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const surveyRoutes = require('./src/routes/surveys');
const questionRoutes = require('./src/routes/questions');
const responseRoutes = require('./src/routes/responses');
const fileRoutes = require('./src/routes/files');
const { downloadCertificateById } = require('./src/controllers/fileController');
const xmlResponse = require('./src/middleware/xmlResponse');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlResponse);

app.use('/api/surveys', surveyRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/files', fileRoutes);
app.get('/api/certificates/:id', downloadCertificateById);

app.use((req, res) => {
  res.status(404).xmlError('The Route is not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).xmlError(err.message || 'Internal server error');
});

app.listen(PORT, () => {
  console.log(`simple-survey API running on port ${PORT}`);
});
