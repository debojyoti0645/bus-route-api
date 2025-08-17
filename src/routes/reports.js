const express = require('express');
const router = express.Router();
const { getTrips, getEarnings } = require('../controllers/reportsController');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');

router.get('/trips', verifyToken, checkRole(['Admin', 'Secretary']), getTrips);
router.get('/earnings', verifyToken, checkRole(['Admin', 'Owner']), getEarnings);
router.get('/fuel', verifyToken, checkRole(['Admin']), getEarnings); // Placeholder for fuel report, using same controller for now

module.exports = router;