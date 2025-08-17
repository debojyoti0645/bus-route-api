const { db } = require("../config/firebase");
const {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc, // Add this import for structured IDs
  updateDoc,
} = require("firebase/firestore");

/**
 * Generates the next structured trip ID
 * @returns {string} Next trip ID in format TRIP_YYYYMMDD_XXX
 */
const getNextTripId = async () => {
  try {
    // Get current date in YYYYMMDD format
    const today = new Date();
    const dateStr =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      today.getDate().toString().padStart(2, "0");

    const tripsRef = collection(db, "trips");
    const snapshot = await getDocs(tripsRef);

    // Find the highest trip number for today
    let highestNum = 0;
    const prefix = `TRIP_${dateStr}_`;

    snapshot.forEach((doc) => {
      if (doc.id.startsWith(prefix)) {
        const num = parseInt(doc.id.substring(prefix.length), 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    });

    const nextNum = highestNum + 1;
    const nextId = `${prefix}${String(nextNum).padStart(3, "0")}`;
    return nextId;
  } catch (error) {
    console.error("Error generating next trip ID:", error);
    throw new Error("Failed to generate trip ID");
  }
};

const startTrip = async (tripData) => {
  try {
    // Generate structured trip ID
    const tripId = await getNextTripId();
    const tripRef = doc(db, "trips", tripId);

    // Use setDoc with structured ID instead of addDoc
    await setDoc(tripRef, {
      ...tripData,
      status: "Running",
      createdAt: new Date(),
    });

    return tripId;
  } catch (error) {
    console.error("Error starting trip:", error);
    throw new Error("Failed to start trip");
  }
};

const endTrip = async (tripId, endData) => {
  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, {
      ...endData,
      status: "Completed",
      endedAt: new Date(),
    });
  } catch (error) {
    console.error("Error ending trip:", error);
    throw new Error("Failed to end trip");
  }
};

const getTripsByStation = async (stationId) => {
  try {
    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("starterStationId", "==", stationId));
    const snapshot = await getDocs(q);
    const trips = [];
    snapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error("Error getting trips by station:", error);
    throw new Error("Failed to get trips");
  }
};

const getDailyReportForStation = async (stationId, date) => {
  try {
    const allTrips = await getTripsByStation(stationId);
    const dailyTrips = allTrips.filter(
      (trip) => trip.createdAt.toDate().toISOString().split("T")[0] === date
    );

    const totalSales = dailyTrips.reduce(
      (sum, trip) => sum + (trip.ticketSales || 0),
      0
    );
    const totalExpenses = dailyTrips.reduce(
      (sum, trip) => sum + (trip.expenses || 0),
      0
    );
    const totalProfit = totalSales - totalExpenses;

    return {
      date,
      stationId,
      totalTrips: dailyTrips.length,
      totalSales,
      totalExpenses,
      totalProfit,
    };
  } catch (error) {
    console.error("Error generating daily report:", error);
    throw new Error("Failed to generate daily report");
  }
};

const getTripById = async (tripId) => {
  try {
    const tripRef = doc(db, "trips", tripId);
    const tripDoc = await getDoc(tripRef);

    if (!tripDoc.exists()) {
      return null;
    }

    return { id: tripDoc.id, ...tripDoc.data() };
  } catch (error) {
    console.error("Error getting trip by ID:", error);
    throw new Error("Failed to get trip");
  }
};

const getDailyTotalsForBus = async (busId, date) => {
  try {
    const tripsRef = collection(db, "trips");
    const q = query(tripsRef, where("busId", "==", busId));
    const snapshot = await getDocs(q);

    const allTrips = [];
    snapshot.forEach((doc) => {
      allTrips.push({ id: doc.id, ...doc.data() });
    });

    const dailyTrips = allTrips.filter((trip) => {
      if (!trip.createdAt) return false;
      const tripDate = trip.createdAt.toDate().toISOString().split("T")[0];
      return tripDate === date;
    });

    const totalSales = dailyTrips.reduce(
      (sum, trip) => sum + (trip.ticketSales || 0),
      0
    );
    const totalExpenses = dailyTrips.reduce(
      (sum, trip) => sum + (trip.expenses || 0),
      0
    );
    const totalProfit = totalSales - totalExpenses;

    return {
      date,
      busId,
      totalTrips: dailyTrips.length,
      totalSales,
      totalExpenses,
      totalProfit,
      trips: dailyTrips,
    };
  } catch (error) {
    console.error("Error getting daily totals for bus:", error);
    throw new Error("Failed to get daily totals");
  }
};

/**
 * Gets all trips for a specific date (using structured ID)
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of trips for the specified date
 */
const getTripsByDate = async (date) => {
  try {
    // Convert YYYY-MM-DD to YYYYMMDD for ID matching
    const dateStr = date.replace(/-/g, "");
    const prefix = `TRIP_${dateStr}_`;

    const tripsRef = collection(db, "trips");
    const snapshot = await getDocs(tripsRef);

    const trips = [];
    snapshot.forEach((doc) => {
      if (doc.id.startsWith(prefix)) {
        trips.push({ id: doc.id, ...doc.data() });
      }
    });

    // Sort by trip ID (which will be chronological)
    trips.sort((a, b) => a.id.localeCompare(b.id));

    return trips;
  } catch (error) {
    console.error("Error getting trips by date:", error);
    throw new Error("Failed to get trips by date");
  }
};

/**
 * Gets trip statistics for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {object} Trip statistics for the date
 */
const getTripStatsForDate = async (date) => {
  try {
    const trips = await getTripsByDate(date);

    const stats = {
      date,
      totalTrips: trips.length,
      completedTrips: trips.filter((t) => t.status === "Completed").length,
      runningTrips: trips.filter((t) => t.status === "Running").length,
      totalSales: trips.reduce((sum, trip) => sum + (trip.ticketSales || 0), 0),
      totalExpenses: trips.reduce((sum, trip) => sum + (trip.expenses || 0), 0),
      uniqueBuses: [...new Set(trips.map((t) => t.busId))].length,
      trips: trips,
    };

    stats.totalProfit = stats.totalSales - stats.totalExpenses;

    return stats;
  } catch (error) {
    console.error("Error getting trip stats for date:", error);
    throw new Error("Failed to get trip statistics");
  }
};

module.exports = {
  startTrip,
  endTrip,
  getTripsByStation,
  getDailyReportForStation,
  getTripById,
  getDailyTotalsForBus,
  getNextTripId,
  getTripsByDate,
  getTripStatsForDate,
};
