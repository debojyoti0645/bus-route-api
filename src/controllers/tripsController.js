const tripsService = require("../services/tripsService");
const busService = require("../services/busService");

// Helper function to remove undefined values from an object
const removeUndefinedFields = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const startNewTrip = async (req, res) => {
  const { busId, departureTime, route, driverId, conductorId } = req.body;
  const { userId } = req.user;

  try {
    const starterStationId = "STATION_A";

    // First check if bus exists and is available
    const bus = await busService.getBusById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (bus.status !== "active" && bus.status !== "Available") {
      return res.status(400).json({
        message: `Bus is not available. Current status: ${bus.status}`,
      });
    }

    const tripData = removeUndefinedFields({
      busId,
      departureTime,
      route,
      driverId,
      conductorId,
      starterId: userId,
      starterStationId,
      status: "Running",
    });

    // Start the trip
    const tripId = await tripsService.startTrip(tripData);

    // Update bus status to "In Transit"
    await busService.updateBusStatus(busId, "In Transit");

    res.status(201).json({ message: "Trip started successfully", tripId });
  } catch (error) {
    console.error("Error starting trip:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const endTrip = async (req, res) => {
  const { tripId } = req.params;
  const { arrivalTime, ticketSales, expenses, incentives } = req.body;
  const { userId } = req.user;

  try {
    // First get the trip to find the busId
    const trip = await tripsService.getTripById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.status === "Completed") {
      return res.status(400).json({ message: "Trip is already completed" });
    }

    const endData = removeUndefinedFields({
      arrivalTime,
      ticketSales,
      expenses,
      incentives,
    });

    // End the trip
    await tripsService.endTrip(tripId, endData);

    // Update bus status back to available
    await busService.updateBusStatus(trip.busId, "active");

    res.json({ message: "Trip ended successfully" });
  } catch (error) {
    console.error("Error ending trip:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getStationTrips = async (req, res) => {
  const { stationId } = req.params;
  try {
    const trips = await tripsService.getTripsByStation(stationId);
    res.json(trips);
  } catch (error) {
    console.error("Error getting station trips:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDailyReport = async (req, res) => {
  const { stationId, date } = req.params;
  try {
    const report = await tripsService.getDailyReportForStation(stationId, date);
    res.json(report);
  } catch (error) {
    console.error("Error getting daily report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  startNewTrip,
  endTrip,
  getStationTrips,
  getDailyReport,
};
