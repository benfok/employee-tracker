const mysql = require('mysql2');
require('dotenv').config();

// create the connection to database
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user:  process.env.DB_USER,
  password: process.env.DB_PWORD,
  database: process.env.DB_NAME,
  // This overrides a default setting allowing multiple query statements to be executed separated by a semi-colon. This is needed for some of the functions returning sql data as arrays for prompt choices
  multipleStatements: true
});


module.exports = db;