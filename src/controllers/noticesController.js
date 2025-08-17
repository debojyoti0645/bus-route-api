const { createNotice, getNoticesByRole, deleteNotice } = require('../services/noticeService');

/**
 * Controller to create a new notice.
 */
const addNewNotice = async (req, res) => {
  const { title, message, targetRoles } = req.body;
  const { userId } = req.user;
  try {
    const noticeId = await createNotice({ title, message, targetRoles, createdBy: userId });
    res.status(201).json({ message: 'Notice created successfully', noticeId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Controller to get all notices relevant to the user's role.
 */
const getRelevantNotices = async (req, res) => {
  const { role } = req.user;
  try {
    const notices = await getNoticesByRole(role);
    res.json(notices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Controller to delete a notice by ID.
 */
const deleteNoticeById = async (req, res) => {
  try {
    await deleteNotice(req.params.id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addNewNotice,
  getRelevantNotices,
  deleteNoticeById
};
