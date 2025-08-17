const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");
const { collection, query, where, getDocs } = require("firebase/firestore");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    // The 'userId' from the JWT payload is the user's ID field (e.g., ADM001)
    const userId = decodedToken.userId;

    // We must now use a query to find the document with the matching 'id' field
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      // No document found with the matching 'id' field
      return res.status(401).json({ message: "User not found" });
    }

    // Get the first (and only) document from the query result
    const userDoc = userSnapshot.docs[0];

    // We get the user's data and also their 'id' field
    req.user = { docId: userDoc.id, ...userDoc.data() };

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
