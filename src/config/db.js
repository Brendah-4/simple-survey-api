const mysql = require('mysql2/promise');
<<<<<<< HEAD

=======
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'simple_survey',
  waitForConnections: true,
  connectionLimit: 10,
<<<<<<< HEAD
});

=======
  ssl: {
    rejectUnauthorized: false
  }
});
>>>>>>> 7aa7e868812127e2898c9e42cf90deabd59fd0f4
module.exports = pool;
