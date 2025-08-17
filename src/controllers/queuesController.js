const {
  getAllQueues,
  addBusToQueue,
  updateQueue,
  deleteQueue,
} = require("../services/queueService");

const listQueues = async (req, res) => {
  const { role, terminalId } = req.user;
  let filter = {};
  if (role === "Starter") {
    // Assuming starter role has a terminalId
    filter.terminalId = terminalId;
  }
  try {
    const queues = await getAllQueues(filter);
    res.json(queues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const addBus = async (req, res) => {
  // Now we expect the timeslot to be part of the request body
  const { busId, routeId, terminalId, timeslot } = req.body;

  if (!busId || !routeId || !terminalId || !timeslot) {
    return res
      .status(400)
      .json({
        message:
          "Missing required fields: busId, routeId, terminalId, or timeslot",
      });
  }

  try {
    const queueId = await addBusToQueue({
      busId,
      routeId,
      terminalId,
      timeslot,
      // Add more data as needed, like driverId, conductorId
    });
    res
      .status(201)
      .json({
        message: "Bus added to queue with timeslot successfully",
        queueId,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const markAsDeparted = async (req, res) => {
  try {
    await updateQueue(req.params.id, {
      status: "departed",
      departedAt: new Date(),
    });
    res.json({ message: "Bus marked as departed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeFromQueue = async (req, res) => {
  try {
    await deleteQueue(req.params.id);
    res.json({ message: "Bus removed from queue" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listQueues,
  addBus,
  markAsDeparted,
  removeFromQueue,
};
