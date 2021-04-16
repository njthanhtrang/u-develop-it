const mysql = require("mysql2");
const express = require("express");
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

// Get all candidates and party affiliation with API endpoint
app.get("/api/candidates", (req, res) => {
  const sql = `SELECT candidates.*, parties.name
  AS party_name
  FROM candidates
  LEFT JOIN parties
  ON candidates.party_id = parties.id`;

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

// GET a single candidate with party affiliation
// if no errors, err is null
app.get("/api/candidate/:id", (req, res) => {
  const sql = `SELECT candidates.*, parties.name
  AS party_name
  FROM candidates
  LEFT JOIN parties
  ON candidates.party_id = parties.id
  WHERE candidates.id = ?`;

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

// Create a candidate
// use obj destructuring to pull body out of req obj
app.post("/api/candidate", ({ body }, res) => {
    // Candidate is allowed not to be affiliated with a party
    const errors = inputCheck(
      body,
      "first_name",
      "last_name",
      "industry_connected"
    );
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
  
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected, party_id)
      VALUES (?, ?, ?, ?)`;
    const params = [body.first_name, body.last_name, body.industry_connected, body.party_id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: body,
        changes: result.affectedRows
      });
    });
  });

// Update a candidate's party
app.put("/api/candidate/:id", (req, res) => {
    // Candidate is allowed to not have party affiliation
    const errors = inputCheck(req.body, "party_id");
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
    const sql = `UPDATE candidates SET party_id = ?
      WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        //   check if a record was found
      } else if (!result.affectedRows) {
        res.json({
          message: "Candidate not found",
        });
      } else {
        res.json({
          message: "success",
          data: req.body,
          changes: result.affectedRows,
        });
      }
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

// Get all parties
app.get("/api/parties", (req, res) => {
    const sql = `SELECT * FROM parties`;
    db.query(sql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: rows,
      });
    });
  });
  
  // Get single party
  app.get("/api/party/:id", (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
  
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
  
//   Delete a party
  app.delete("/api/party/:id", (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: res.message });
        // checks if anything was deleted
      } else if (!result.affectedRows) {
        res.json({
          message: "Party not found",
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
  
// Default Not Found response for unmatched routes
// Must be last route bc will override all others
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
    if (err) throw err;
    console.log("Database connected.");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
});

