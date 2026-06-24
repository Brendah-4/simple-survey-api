<<<<<<< HEAD
require('dotenv').config();
=======
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
<<<<<<< HEAD
    database: process.env.DB_NAME || 'sky_survey_db',
=======
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
    multipleStatements: true,
  });

  console.log('Running database migration...');
  const sql = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8');
  await conn.query(sql);
  await conn.end();
  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
<<<<<<< HEAD
});
=======
});
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
