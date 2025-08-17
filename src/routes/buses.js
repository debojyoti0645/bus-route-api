const express = require("express");
const router = express.Router();
const {
  listAllBuses,
  getBusDetails,
  addNewBus,
  updateBusDetails,
  deleteBusDetails,
  getAvailableBuses,
  updateBusStatus,
} = require("../controllers/busesController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/role");

// Status management routes (put these BEFORE parameterized routes)
router.get(
  "/available",
  verifyToken,
  checkRole(["Admin", "Starter"]),
  getAvailableBuses
);
router.put(
  "/:id/status",
  verifyToken,
  checkRole(["Admin", "Starter"]),
  updateBusStatus
);

// Base routes (put parameterized routes AFTER specific routes)
router.get("/", verifyToken, listAllBuses);
router.get("/:id", verifyToken, getBusDetails);
router.post("/", verifyToken, checkRole(["Admin", "Owner"]), addNewBus);
router.put(
  "/:id",
  verifyToken,
  checkRole(["Admin", "Owner"]),
  updateBusDetails
);
router.delete("/:id", verifyToken, checkRole(["Admin"]), deleteBusDetails);

module.exports = router;
