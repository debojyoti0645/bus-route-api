const { db } = require("../config/firebase");
const {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} = require("firebase/firestore");
const busService = require("../services/busService");

const recordDailyEarnings = async (busId, userId, { totalSales, expenses }) => {
  try {
    const profit = totalSales - expenses;
    const earningsRef = collection(db, "earnings_reports");
    await addDoc(earningsRef, {
      busId,
      ownerId: userId,
      totalSales,
      expenses,
      profit,
      date: new Date(),
    });
  } catch (error) {
    console.error("Error recording daily earnings:", error);
    throw error;
  }
};

const getBusEarningsReports = async (busId, userId) => {
  try {
    const earningsRef = collection(db, "earnings_reports");
    const q = query(
      earningsRef,
      where("busId", "==", busId),
      where("ownerId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const reports = [];
    snapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    return reports;
  } catch (error) {
    console.error("Error getting bus earnings reports:", error);
    throw error;
  }
};

const listAllBuses = async (req, res) => {
  try {
    const buses = await busService.getAllBuses(req.query.ownerId);
    res.status(200).json(buses);
  } catch (error) {
    console.error("Error listing buses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getBusDetails = async (req, res) => {
  try {
    const bus = await busService.getBusById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.status(200).json(bus);
  } catch (error) {
    console.error("Error getting bus details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addNewBus = async (req, res) => {
  try {
    // Validate required fields
    const { numberPlate, route, ownerId } = req.body;

    if (!numberPlate || !route || !ownerId) {
      return res.status(400).json({
        message:
          "Missing required fields: numberPlate, route, and ownerId are required",
      });
    }

    const busId = await busService.createBus(req.body);
    res.status(201).json({
      message: "Bus added successfully",
      busId: busId,
      generatedId: busId,
    });
  } catch (error) {
    console.error("Error adding new bus:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateBusDetails = async (req, res) => {
  try {
    await busService.updateBus(req.params.id, req.body);
    res.status(200).json({ message: "Bus updated successfully" });
  } catch (error) {
    console.error("Error updating bus:", error);
    if (error.message === "Bus not found") {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const deleteBusDetails = async (req, res) => {
  try {
    await busService.deleteBus(req.params.id);
    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Error deleting bus:", error);
    if (error.message === "Bus not found") {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const getAvailableBuses = async (req, res) => {
  try {
    const buses = await busService.getBusesByStatus("active");
    res.status(200).json(buses);
  } catch (error) {
    console.error("Error getting available buses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateBusStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    await busService.updateBusStatus(id, status);
    res.status(200).json({ message: "Bus status updated successfully" });
  } catch (error) {
    console.error("Error updating bus status:", error);
    if (error.message === "Bus not found") {
      return res.status(404).json({ message: "Bus not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listAllBuses,
  getBusDetails,
  addNewBus,
  updateBusDetails,
  deleteBusDetails,
  getAvailableBuses,
  updateBusStatus,
  recordDailyEarnings,
  getBusEarningsReports,
};
