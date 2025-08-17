const express = require('express');
const router = express.Router();
const { addNewNotice, getRelevantNotices, deleteNoticeById } = require('../controllers/noticesController');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');

router.post('/', verifyToken, checkRole(['Admin', 'Secretary']), addNewNotice);
router.get('/', verifyToken, getRelevantNotices); 
router.delete('/:id', verifyToken, checkRole(['Admin']), deleteNoticeById);

module.exports = router;
