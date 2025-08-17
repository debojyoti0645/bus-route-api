const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getLogs,
  getPersonalLogs,
  punchInOut,
} = require("../controllers/attendanceController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/role");

router.post(
  "/",
  verifyToken,
  checkRole(["Driver", "Conductor"]),
  markAttendance
);

router.get("/", verifyToken, checkRole(["Admin", "Secretary"]), getLogs);

router.get("/me", verifyToken, getPersonalLogs);

// Changed from '/api/staff/attendance' to '/punch'
router.post("/punch", verifyToken, checkRole(["Starter"]), punchInOut);

module.exports = router;
