require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import all routers
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const busRoutes = require("./routes/buses");
const timeslotRoutes = require("./routes/timeslots");
const queueRoutes = require("./routes/queues");
const attendanceRoutes = require("./routes/attendance");
const reportRoutes = require("./routes/reports");
const noticeRoutes = require("./routes/notices");
const tripsRoutes = require("./routes/trips");
const healthRoutes = require("./routes/health");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parses incoming JSON payloads
app.use(cors()); // Enables Cross-Origin Resource Sharing

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/timeslots", timeslotRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/staff/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/health", healthRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
