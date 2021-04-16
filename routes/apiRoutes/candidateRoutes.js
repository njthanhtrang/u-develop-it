const express = require("express");
const router = express.Router();
const db = require("../../db/connection");
const inputCheck = require("../../utils/inputCheck");

// Get all candidates and party affiliation with API endpoint
router.get("/candidates", (req, res) => {
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
  router.get("/candidate/:id", (req, res) => {
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
  router.post("/candidate", ({ body }, res) => {
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
    
    //   IF ONLY ONE ?, NO NEED TO USE ARRAY
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
  router.put("/candidate/:id", (req, res) => {
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
  router.delete("/candidate/:id", (req, res) => {
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

module.exports = router;