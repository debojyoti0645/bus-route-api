const express = require("express");
const router = express.Router();

// Import the controller and middleware
const {
  listQueues,
  addBus,
  markAsDeparted,
  removeFromQueue,
} = require("../controllers/queuesController");
const verifyToken = require("../middlewares/auth");
const checkRole = require("../middlewares/role");

// Get a list of all buses in the queue.
// Accessible to Admin, Secretary, and Starter roles.
router.get(
  "/",
  verifyToken,
  checkRole(["admin", "secretary", "starter"]),
  listQueues
);

router.post("/", verifyToken, checkRole(["starter"]), addBus);


router.put("/:id/depart", verifyToken, checkRole(["starter"]), markAsDeparted);

router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin", "starter"]),
  removeFromQueue
);

module.exports = router;
