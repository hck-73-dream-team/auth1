const express = require("express");
const UserController = require("./controllers/UserController");
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Hello from Auth1 App!");
});

app.post("/login", UserController.login);

// Start the server
app.listen(port, () => {
  console.log(`Auth1 App listening at http://localhost:${port}`);
});

module.exports = app;
