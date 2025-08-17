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

const getAllUsers = async () => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  const users = [];
  snapshot.forEach((doc) => {
    const userData = doc.data();
    // Ensure we don't return the hashed password
    const { hashedPassword, ...userWithoutPassword } = userData;
    users.push({ docId: doc.id, ...userWithoutPassword });
  });
  return users;
};

const findUserById = async (userId) => {
  try {
    // First try to get the document directly using the userId as document ID
    const userRef = doc(db, "users", userId);
    const directUserDoc = await getDoc(userRef);

    if (directUserDoc.exists()) {
      const userData = directUserDoc.data();
      const { hashedPassword, ...userWithoutPassword } = userData;
      return {
        docId: directUserDoc.id,
        ...userWithoutPassword,
      };
    }

    // Fallback: search by id field (for backwards compatibility)
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const fallbackUserDoc = snapshot.docs[0];
    const userData = fallbackUserDoc.data();
    const { hashedPassword, ...userWithoutPassword } = userData;

    return {
      docId: fallbackUserDoc.id,
      ...userWithoutPassword,
    };
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    // Clean the update data to ensure no undefined values and no password updates through this method
    const cleanedData = {};
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] !== undefined &&
        key !== "hashedPassword" &&
        key !== "id"
      ) {
        cleanedData[key] = updateData[key];
      }
    });

    console.log(`Attempting to update user: ${userId}`);
    console.log("Update data:", cleanedData);

    // Try to update using userId as document ID first
    const userRef = doc(db, "users", userId);
    const directUserDoc = await getDoc(userRef);

    if (directUserDoc.exists()) {
      console.log("Found user by document ID, updating...");
      await updateDoc(userRef, cleanedData);
      return;
    }

    // Fallback: search by id field and update
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log("Found user by id field, updating...");
      const fallbackUserDoc = snapshot.docs[0];
      await updateDoc(doc(db, "users", fallbackUserDoc.id), cleanedData);
      return;
    }

    // Additional debug: List all users to see what IDs exist
    console.log("User not found. Listing all users for debugging:");
    const allUsersSnapshot = await getDocs(usersRef);
    allUsersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      console.log(
        `Document ID: ${userDoc.id}, User ID: ${userData.id}, Name: ${userData.name}, Role: ${userData.role}`
      );
    });

    throw new Error(`User not found: ${userId}`);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    // Try to delete using userId as document ID first
    const userRef = doc(db, "users", userId);
    const directUserDoc = await getDoc(userRef);

    if (directUserDoc.exists()) {
      await deleteDoc(userRef);
      return;
    }

    // Fallback: search by id field and delete
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const fallbackUserDoc = snapshot.docs[0];
      await deleteDoc(doc(db, "users", fallbackUserDoc.id));
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

module.exports = {
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};
