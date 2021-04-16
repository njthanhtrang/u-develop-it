const mysql = require("mysql2");

// Connect to election database
const db = mysql.createConnection(
    {
      host: "localhost",
      // Your MySQL username,
      user: "root",
      // Your MySQL password
      password: "sentireasons",
      database: "election",
    });

module.exports = db;