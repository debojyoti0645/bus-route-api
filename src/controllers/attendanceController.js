const {
  createAttendanceRecord,
  getAttendanceLogs,
  getAttendanceForUser,
  recordPunch,
} = require("../services/attendanceService");

const markAttendance = async (req, res) => {
  const { userId, role } = req.user;
  const { status, date } = req.body;

  try {
    const attendanceId = await createAttendanceRecord({
      userId,
      role,
      status,
      date,
    });
    res
      .status(201)
      .json({ message: "Attendance marked successfully", attendanceId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await getAttendanceLogs();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPersonalLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const personalLogs = await getAttendanceForUser(userId);

    res.status(200).json({
      success: true,
      data: personalLogs
    });

  } catch (error) {
    console.error('Error fetching personal attendance logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personal attendance logs'
    });
  }
};

const punchInOut = async (req, res) => {
  const { userId } = req.body;
  const { action } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (!action || (action !== "punch_in" && action !== "punch_out")) {
    return res.status(400).json({
      message: 'Invalid action specified. Must be "punch_in" or "punch_out"',
    });
  }

  try {
    await recordPunch(userId, action);
    res.status(201).json({
      message: `Successfully recorded ${action} for user ${userId}`,
    });
  } catch (error) {
    console.error(error);

    // Handle specific error cases
    if (error.message === "User is already punched in") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User is already punched out") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Cannot punch out without first punching in") {
      return res.status(400).json({ message: error.message });
    }

    // Default server error
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  markAttendance,
  getLogs,
  getPersonalLogs,
  punchInOut,
};
