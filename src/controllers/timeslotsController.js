const { getAllTimeslots, createTimeslot, updateTimeslot, deleteTimeslot } = require('../services/timeSlotService');

const listTimeslots = async (req, res) => {
  const { routeId, terminalId } = req.query;
  try {
    const timeslots = await getAllTimeslots({ routeId, terminalId });
    res.json(timeslots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addNewTimeslot = async (req, res) => {
  try {
    const timeslotId = await createTimeslot(req.body);
    res.status(201).json({ message: 'Timeslot created successfully', timeslotId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTimeslotDetails = async (req, res) => {
  try {
    await updateTimeslot(req.params.id, req.body);
    res.json({ message: 'Timeslot updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTimeslotDetails = async (req, res) => {
  try {
    await deleteTimeslot(req.params.id);
    res.json({ message: 'Timeslot deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  listTimeslots,
  addNewTimeslot,
  updateTimeslotDetails,
  deleteTimeslotDetails
};
