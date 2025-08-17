const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  setDoc,
  doc,
} = require("firebase/firestore");

// Helper function to get the next sequential ID based on role
const getNextUserId = async (role) => {
  let prefix = "";
  switch (role.toLowerCase()) {
    case "admin":
      prefix = "ADM";
      break;
    case "owner":
      prefix = "OWN";
      break;
    case "secretary":
      prefix = "SEC";
      break;
    case "starter":
      prefix = "STR";
      break;
    case "driver":
    case "conductor":
      prefix = "STF";
      break;
    default:
      throw new Error("Invalid role provided for ID generation");
  }

  const usersRef = collection(db, "users");
  const userSnapshot = await getDocs(usersRef);

  let highestNum = 0;
  userSnapshot.docs.forEach((docSnap) => {
    const userData = docSnap.data();
    if (userData.id && userData.id.startsWith(prefix)) {
      const num = parseInt(userData.id.substring(prefix.length), 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  });

  const nextNum = highestNum + 1;
  const nextNumPadded = String(nextNum).padStart(3, "0");
  return prefix + nextNumPadded;
};

const registerUser = async (password, userData) => {
  // Generate the user ID automatically based on role
  const userId = await getNextUserId(userData.role);

  // Check if user already exists (shouldn't happen with auto-generated IDs, but good to verify)
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("id", "==", userId));
  const userSnapshot = await getDocs(q);

  if (!userSnapshot.empty) {
    throw new Error("User ID conflict occurred");
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a clean user object with only defined values
  const userDataToSave = {
    id: userId, // This will be the same as the document ID
    name: userData.name,
    role: userData.role,
    phone: userData.phone || null,
    hashedPassword: hashedPassword,
    createdAt: new Date(),
    status: "active",
    assignedBuses: userData.assignedBuses || [], // Provide empty array as default
  };

  // Use the generated userId as both the document ID and the id field
  await setDoc(doc(db, "users", userId), userDataToSave);

  return userId;
};

const loginUser = async (id, password) => {
  try {
    // Find user by their ID field
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", id));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      throw new Error("Invalid credentials");
    }

    // Get the first matching user
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if hashedPassword exists
    if (!userData.hashedPassword) {
      throw new Error("Invalid credentials");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, userData.hashedPassword);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Return user data without the hashed password
    const { hashedPassword, ...userWithoutPassword } = userData;
    return { ...userWithoutPassword, docId: userDoc.id };
  } catch (error) {
    console.error("Login error:", error.message);
    throw new Error("Invalid credentials");
  }
};

module.exports = {
  registerUser,
  loginUser,
};
