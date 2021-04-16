const express = require("express");
const db = require("./db/connection");
const apiRoutes = require("./routes/apiRoutes");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// using /api prefix here, we can remove from indv route expression
// we don't have to specify index.js in path bc Node.js looks for it when requiring dir
app.use("/api", apiRoutes);

// confirm Express.js connection
// app.get("/", (req, res) => {
//     res.json({
//         message: "Hello World"
//     });
// });

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

