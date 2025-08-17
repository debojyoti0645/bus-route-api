const { db: timeslotDb } = require('../config/firebase');

const getAllTimeslots = async (filter = {}) => {
  const timeslotsRef = timeslotDb.collection('timeslots');
  let query = timeslotsRef;
  if (filter.routeId) {
    query = query.where('routeId', '==', filter.routeId);
  }
  if (filter.terminalId) {
    query = query.where('terminalId', '==', filter.terminalId);
  }
  const snapshot = await query.get();
  const timeslots = [];
  snapshot.forEach(doc => {
    timeslots.push({ id: doc.id, ...doc.data() });
  });
  return timeslots;
};

const createTimeslot = async (timeslotData) => {
  const timeslotRef = timeslotDb.collection('timeslots').doc();
  await timeslotRef.set({ ...timeslotData, createdAt: new Date() });
  return timeslotRef.id;
};

const updateTimeslot = async (timeslotId, updateData) => {
  const timeslotRef = timeslotDb.collection('timeslots').doc(timeslotId);
  await timeslotRef.update(updateData);
};

const deleteTimeslot = async (timeslotId) => {
  const timeslotRef = timeslotDb.collection('timeslots').doc(timeslotId);
  await timeslotRef.delete();
};

module.exports = {
  getAllTimeslots,
  createTimeslot,
  updateTimeslot,
  deleteTimeslot
};