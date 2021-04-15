const express = require("express");
const mysql = require("mysql2");
const inputCheck = require("./utils/inputCheck");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // Your MySQL username,
    user: "root",
    // Your MySQL password
    password: "sentireasons",
    database: "election",
  },
  console.log("Connected to the election database.")
);

// confirm Express.js connection
// app.get("/", (req, res) => {
//     res.json({
//         message: "Hello World"
//     });
// });

// Get all candidates with API endpoint
app.get("/api/candidates", (req, res) => {
  const sql = `SELECT * FROM candidates`;

  db.query(sql, (err, rows) => {
    if (err) {
      // server error, not 404 user request error
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// GET a single candidate
// if no errors, err is null
app.get("/api/candidate/:id", (req, res) => {
  const sql = `SELECT * FROM candidates WHERE id = ?`;
  //   assign captured value in req.params obj with key id
  const params = [req.params.id];

  // query candidates table with this ID and retrieve row
  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

// DELETE a candidate
// ? is a prepared statement, executers same statements repeatedly
// blocks SQL injection attacks, replaces client user var and inserts alt commands
app.delete("/api/candidate/:id", (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.statusMessage(400).json({ error: res.message });
      //   no candidate by that id
    } else if (!result.affectedRows) {
      res.json({
        message: "Candidate not found",
      });
    } else {
      res.json({
        message: "deleted",
        changes: result.affectedRows,
        id: req.params.id,
      });
    }
  });
});

// Create a candidate
// use obj destructuring to pull body out of req obj
app.post("/api/candidate", ({ body }, res) => {
  const errors = inputCheck(
    body,
    "first_name",
    "last_name",
    "industry_connected"
  );
  if (errors) {
    res.status(400).json({ error: errors });
  }
  
  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
    VALUES (?, ?, ?)`;
  const params = [body.first_name, body.last_name, body.industry_connected];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: body,
    });
  });
});

// Default response for any other request (Not Found)
// Must be last route bc will override all others
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
