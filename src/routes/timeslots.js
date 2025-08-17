const express = require('express');
const router = express.Router();
const { listTimeslots, addNewTimeslot, updateTimeslotDetails, deleteTimeslotDetails } = require('../controllers/timeslotsController');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');

router.get('/', verifyToken, checkRole(['Admin', 'Secretary']), listTimeslots);
router.post('/', verifyToken, checkRole(['Admin', 'Secretary']), addNewTimeslot);
router.put('/:id', verifyToken, checkRole(['Admin', 'Secretary']), updateTimeslotDetails);
router.delete('/:id', verifyToken, checkRole(['Admin', 'Secretary']), deleteTimeslotDetails);

module.exports = router;