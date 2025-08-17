const express = require("express");
const router = express.Router();
const { healthCheck } = require("../controllers/healthController");

// Health check endpoint - no authentication required
router.get("/", healthCheck);
router.get("/status", healthCheck);

module.exports = router;
