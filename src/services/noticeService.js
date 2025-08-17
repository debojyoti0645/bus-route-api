const { db } = require("../config/firebase");
const { collection, addDoc, query, where, getDocs, doc, deleteDoc } = require("firebase/firestore");

/**
 * Creates a new notice in the database
 */
const createNotice = async (noticeData) => {
  try {
    const noticesRef = collection(db, "notices");
    const docRef = await addDoc(noticesRef, {
      ...noticeData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating notice:", error);
    throw new Error("Failed to create notice");
  }
};

/**
 * Gets notices relevant to a specific role
 */
const getNoticesByRole = async (userRole) => {
  try {
    const noticesRef = collection(db, "notices");
    const q = query(noticesRef, where("targetRoles", "array-contains", userRole));
    const snapshot = await getDocs(q);
    
    const notices = [];
    snapshot.forEach(doc => {
      notices.push({ id: doc.id, ...doc.data() });
    });
    return notices;
  } catch (error) {
    console.error("Error getting notices:", error);
    throw new Error("Failed to fetch notices");
  }
};

/**
 * Deletes a notice by ID
 */
const deleteNotice = async (noticeId) => {
  try {
    const noticeRef = doc(db, "notices", noticeId);
    await deleteDoc(noticeRef);
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw new Error("Failed to delete notice");
  }
};

module.exports = {
  createNotice,
  getNoticesByRole,
  deleteNotice
};
