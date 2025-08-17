const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');
const { db } = require('../config/firebase');
const { collection, getDocs } = require('firebase/firestore');

// Middleware to check if any users exist
const checkFirstUser = async (req, res, next) => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    
    if (snapshot.empty && req.body.role === 'Admin') {
      // If no users exist and the registration is for an admin, allow it
      return next();
    }
    
    // If users exist, require authentication
    return verifyToken(req, res, () => {
      checkRole(['Admin'])(req, res, next);
    });
  } catch (error) {
    console.error('Error checking first user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

router.post('/login', login);
router.post('/register', checkFirstUser, register);
router.get('/me', verifyToken, getMe);

module.exports = router;