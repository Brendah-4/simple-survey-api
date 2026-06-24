require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD

=======
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
const surveyRoutes = require('./src/routes/surveys');
const questionRoutes = require('./src/routes/questions');
const responseRoutes = require('./src/routes/responses');
const fileRoutes = require('./src/routes/files');
const { downloadCertificateById } = require('./src/controllers/fileController');
const xmlResponse = require('./src/middleware/xmlResponse');
<<<<<<< HEAD

const app = express();
const PORT = process.env.PORT || 3000;

=======
const app = express();
const PORT = process.env.PORT || 3000;
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlResponse);
<<<<<<< HEAD

=======
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
app.use('/api/surveys', surveyRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/files', fileRoutes);
app.get('/api/certificates/:id', downloadCertificateById);
<<<<<<< HEAD

app.use((req, res) => {
  res.status(404).xmlError('The Route is not found');
});

=======
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'simple-survey API is running' });
});
app.use((req, res) => {
  res.status(404).xmlError('Route not found');
});
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).xmlError(err.message || 'Internal server error');
});
<<<<<<< HEAD

=======
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
app.listen(PORT, () => {
  console.log(`simple-survey API running on port ${PORT}`);
});
