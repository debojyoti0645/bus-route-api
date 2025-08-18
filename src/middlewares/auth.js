const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");
const { collection, query, where, getDocs } = require("firebase/firestore");

const verifyToken = async (req, res, next) => {
  try {
    // Check for token in different places
    const token =
      req.headers.authorization?.split(" ")[1] || // Bearer Token
      req.cookies?.token || // Cookie
      req.body.token || // Request Body
      req.query.token; // Query Parameter

    if (!token) {
      return res.status(401).json({
        isLoggedIn: false,
        message: "Authentication token missing",
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    // Check token expiration
    if (decodedToken.exp < Date.now() / 1000) {
      return res.status(401).json({
        isLoggedIn: false,
        message: "Token has expired",
      });
    }

    // Get user data from database
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", decodedToken.userId));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      return res.status(401).json({
        isLoggedIn: false,
        message: "User not found",
      });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Attach user data to request
    req.user = {
      docId: userDoc.id,
      ...userData,
      isLoggedIn: true,
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      isLoggedIn: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyToken;
