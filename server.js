require("dotenv").config(); // Load environment variables (only for local dev)
const http = require("http");
const app = require("./src/app"); // Import Express app

// PORT setup (Render will provide PORT env variable)
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`🚍 Bus Management API running on port ${PORT}`);
});
