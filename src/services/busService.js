const { db } = require("../config/firebase");
const {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} = require("firebase/firestore");

// Gets all buses, or only those owned by a specific ownerId if provided
const getAllBuses = async (ownerId) => {
  try {
    const busesRef = collection(db, "buses");
    let q;

    if (ownerId) {
      // Filter by ownerId if it exists
      q = query(busesRef, where("ownerId", "==", ownerId));
    } else {
      // Otherwise, get all buses (for Admin role)
      q = busesRef;
    }

    const snapshot = await getDocs(q);
    const buses = [];
    snapshot.forEach((doc) => {
      buses.push({ id: doc.id, ...doc.data() });
    });
    return buses;
  } catch (error) {
    console.error("Error getting buses:", error);
    throw error;
  }
};

const getBusById = async (busId) => {
  try {
    // First try to get the document directly using busId as document ID
    const busRef = doc(db, "buses", busId);
    const directBusDoc = await getDoc(busRef);

    if (directBusDoc.exists()) {
      return { id: directBusDoc.id, ...directBusDoc.data() };
    }

    // Fallback: search by busId field (for backwards compatibility)
    const busesRef = collection(db, "buses");
    const q = query(busesRef, where("busId", "==", busId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const fallbackBusDoc = snapshot.docs[0];
    return { id: fallbackBusDoc.id, ...fallbackBusDoc.data() };
  } catch (error) {
    console.error("Error getting bus:", error);
    throw error;
  }
};

const getNextBusId = async () => {
  try {
    const busesRef = collection(db, "buses");
    const snapshot = await getDocs(busesRef);

    let highestNum = 0;
    snapshot.forEach((docSnap) => {
      const busData = docSnap.data();
      // Check both document ID and internal busId field for BUS prefix
      if (busData.busId && busData.busId.startsWith("BUS")) {
        const num = parseInt(busData.busId.substring(3), 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
      // Also check document ID for backwards compatibility
      if (docSnap.id.startsWith("BUS")) {
        const num = parseInt(docSnap.id.substring(3), 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    });

    const nextNum = highestNum + 1;
    const nextId = `BUS${String(nextNum).padStart(3, "0")}`;
    return nextId;
  } catch (error) {
    console.error("Error generating next bus ID:", error);
    throw error;
  }
};

const createBus = async (busData) => {
  try {
    const busId = await getNextBusId();
    const busRef = doc(db, "buses", busId); // Use busId as document ID

    // Extract required fields from busData
    const { numberPlate, route, driverId, conductorId, ownerId } = busData;

    // Create bus document with specified fields
    await setDoc(busRef, {
      busId: busId, // Store the same ID internally
      numberPlate: numberPlate || null,
      route: route || null,
      driverId: driverId || null,
      conductorId: conductorId || null,
      ownerId: ownerId || null,
      status: "Available", // Set default status to "Available"
      createdAt: new Date(),
    });

    return busId;
  } catch (error) {
    console.error("Error creating bus:", error);
    throw error;
  }
};

const updateBus = async (busId, updateData) => {
  try {
    // Clean the update data to ensure no undefined values and no busId updates
    const cleanedData = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "busId") {
        cleanedData[key] = updateData[key];
      }
    });

    // Try to update using busId as document ID first
    const busRef = doc(db, "buses", busId);
    const directBusDoc = await getDoc(busRef);

    if (directBusDoc.exists()) {
      await updateDoc(busRef, cleanedData);
      return;
    }

    // Fallback: search by busId field and update
    const busesRef = collection(db, "buses");
    const q = query(busesRef, where("busId", "==", busId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const fallbackBusDoc = snapshot.docs[0];
      await updateDoc(doc(db, "buses", fallbackBusDoc.id), cleanedData);
    } else {
      throw new Error("Bus not found");
    }
  } catch (error) {
    console.error("Error updating bus:", error);
    throw error;
  }
};

const deleteBus = async (busId) => {
  try {
    // Try to delete using busId as document ID first
    const busRef = doc(db, "buses", busId);
    const directBusDoc = await getDoc(busRef);

    if (directBusDoc.exists()) {
      await deleteDoc(busRef);
      return;
    }

    // Fallback: search by busId field and delete
    const busesRef = collection(db, "buses");
    const q = query(busesRef, where("busId", "==", busId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const fallbackBusDoc = snapshot.docs[0];
      await deleteDoc(doc(db, "buses", fallbackBusDoc.id));
    } else {
      throw new Error("Bus not found");
    }
  } catch (error) {
    console.error("Error deleting bus:", error);
    throw error;
  }
};

const getBusesByStatus = async (status) => {
  try {
    const busesRef = collection(db, "buses");
    const q = query(busesRef, where("status", "==", status));
    const snapshot = await getDocs(q);
    const buses = [];
    snapshot.forEach((doc) => {
      buses.push({ id: doc.id, ...doc.data() });
    });
    return buses;
  } catch (error) {
    console.error("Error getting buses by status:", error);
    throw error;
  }
};

const getAvailableBuses = async () => {
  try {
    const busesRef = collection(db, "buses");
    // Query for buses that are either "active" or "Available" (excluding "In Transit")
    const activeQuery = query(busesRef, where("status", "==", "active"));
    const availableQuery = query(busesRef, where("status", "==", "Available"));

    const [activeSnapshot, availableSnapshot] = await Promise.all([
      getDocs(activeQuery),
      getDocs(availableQuery),
    ]);

    const buses = [];
    activeSnapshot.forEach((doc) => {
      buses.push({ id: doc.id, ...doc.data() });
    });
    availableSnapshot.forEach((doc) => {
      buses.push({ id: doc.id, ...doc.data() });
    });

    return buses;
  } catch (error) {
    console.error("Error getting available buses:", error);
    throw error;
  }
};

const updateBusStatus = async (busId, newStatus) => {
  try {
    // Try to update using busId as document ID first
    const busRef = doc(db, "buses", busId);
    const directBusDoc = await getDoc(busRef);

    if (directBusDoc.exists()) {
      await updateDoc(busRef, { status: newStatus });
      return;
    }

    // Fallback: search by busId field and update
    const busesRef = collection(db, "buses");
    const q = query(busesRef, where("busId", "==", busId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const fallbackBusDoc = snapshot.docs[0];
      await updateDoc(doc(db, "buses", fallbackBusDoc.id), {
        status: newStatus,
      });
    } else {
      throw new Error("Bus not found");
    }
  } catch (error) {
    console.error("Error updating bus status:", error);
    throw error;
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  getNextBusId,
  createBus,
  updateBus,
  deleteBus,
  getBusesByStatus,
  getAvailableBuses,
  updateBusStatus,
};
