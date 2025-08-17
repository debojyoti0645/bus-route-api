const express = require("express");
const router = express.Router();
const {
  startNewTrip,
  endTrip,
  getStationTrips,
  getDailyReport,
} = require("../controllers/tripsController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/role");

// POST route to start a new trip.
router.post(
  "/start",
  verifyToken,
  checkRole(["Admin", "Starter"]),
  startNewTrip
);

// POST route to end a trip.
router.post(
  "/end/:tripId",
  verifyToken,
  checkRole(["Admin", "Starter"]),
  endTrip
);

// GET route to view all trips for a specific station.
router.get(
  "/station/:stationId",
  verifyToken,
  checkRole(["Admin", "Starter"]),
  getStationTrips
);

// GET route for a daily report for a specific station.
router.get(
  "/reports/daily/:stationId/:date",
  verifyToken,
  checkRole(["Admin", "Starter"]),
  getDailyReport
);

module.exports = router;
