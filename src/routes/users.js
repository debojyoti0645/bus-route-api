const express = require('express');
const router = express.Router();
const { listAllUsers, getUserById, updateUserDetails, deleteUserById } = require('../controllers/usersController');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');

// All these routes require a valid token and Admin role
router.get('/', verifyToken, checkRole(['Admin']), listAllUsers);
router.get('/:id', verifyToken, checkRole(['Admin']), getUserById);
router.put('/:id', verifyToken, checkRole(['Admin']), updateUserDetails);
router.delete('/:id', verifyToken, checkRole(['Admin']), deleteUserById);

module.exports = router;
