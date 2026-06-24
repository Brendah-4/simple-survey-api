require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sky_survey_db',
    multipleStatements: true,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Running database migration...');
  let sql = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8');
  sql = sql.replace(/CREATE DATABASE[^;]+;/gi, '');
  sql = sql.replace(/USE [^;]+;/gi, '');
  await conn.query(sql);
  await conn.end();
  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});