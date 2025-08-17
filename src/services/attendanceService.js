const { db } = require("../config/firebase");
const {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} = require("firebase/firestore");

const createAttendanceRecord = async (attendanceData) => {
  try {
    const attendanceRef = collection(db, "attendance");
    const docRef = await addDoc(attendanceRef, {
      ...attendanceData,
      recordedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating attendance record:", error);
    throw new Error("Failed to create attendance record");
  }
};

const getAttendanceLogs = async () => {
  try {
    const attendanceRef = collection(db, "attendance");
    const snapshot = await getDocs(attendanceRef);
    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } catch (error) {
    console.error("Error fetching attendance logs:", error);
    throw new Error("Failed to fetch attendance logs");
  }
};

const getAttendanceForUser = async (userId) => {
  try {
    const attendanceRef = collection(db, "staff_attendance");
    const q = query(
      attendanceRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);

    const logs = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate(),
      });
    });

    return logs;
  } catch (error) {
    console.error("Error in getAttendanceForUser:", error);
    throw error;
  }
};

const getLastPunchRecord = async (userId) => {
  try {
    const staffAttendanceRef = collection(db, "staff_attendance");
    const q = query(
      staffAttendanceRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    try {
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };
    } catch (error) {
      // Check if the error is due to missing index
      if (
        error.code === "failed-precondition" &&
        error.message.includes("index")
      ) {
        console.warn("Waiting for index to be built. Using fallback query...");
        // Fallback: Get all records for user and sort in memory
        const simpleQuery = query(
          staffAttendanceRef,
          where("userId", "==", userId)
        );
        const allDocs = await getDocs(simpleQuery);

        if (allDocs.empty) {
          return null;
        }

        // Sort docs by timestamp in memory
        const docs = [];
        allDocs.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
        docs.sort((a, b) => b.timestamp - a.timestamp);

        return docs[0];
      }
      throw error;
    }
  } catch (error) {
    console.error("Error getting last punch record:", error);
    throw new Error("Failed to get last punch record");
  }
};

const recordPunch = async (userId, action) => {
  try {
    // Get the last punch record for this user
    const lastPunch = await getLastPunchRecord(userId);

    // Validate punch action
    if (lastPunch) {
      if (action === "punch_in" && lastPunch.action === "punch_in") {
        throw new Error("User is already punched in");
      }
      if (action === "punch_out" && lastPunch.action === "punch_out") {
        throw new Error("User is already punched out");
      }
    } else if (action === "punch_out") {
      throw new Error("Cannot punch out without first punching in");
    }

    const staffAttendanceRef = collection(db, "staff_attendance");
    await addDoc(staffAttendanceRef, {
      userId,
      action,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error recording staff attendance:", error);
    throw error; // Throw the original error to preserve the message
  }
};

module.exports = {
  createAttendanceRecord,
  getAttendanceLogs,
  getAttendanceForUser,
  recordPunch,
  getLastPunchRecord, // Export the new function
};
