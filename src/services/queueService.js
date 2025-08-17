const { db: queueDb } = require('../config/firebase');

const getAllQueues = async (filter = {}) => {
  const queuesRef = queueDb.collection('queues');
  let query = queuesRef;
  if (filter.terminalId) {
    query = query.where('terminalId', '==', filter.terminalId);
  }
  const snapshot = await query.get();
  const queues = [];
  snapshot.forEach(doc => {
    queues.push({ id: doc.id, ...doc.data() });
  });
  return queues;
};

const addBusToQueue = async (queueData) => {
  const queueRef = queueDb.collection('queues').doc();
  // We've updated this to include the timeslot and other dynamic data
  await queueRef.set({ ...queueData, status: 'queued', queuedAt: new Date() });
  return queueRef.id;
};

const updateQueue = async (queueId, updateData) => {
  const queueRef = queueDb.collection('queues').doc(queueId);
  await queueRef.update(updateData);
};

const deleteQueue = async (queueId) => {
  const queueRef = queueDb.collection('queues').doc(queueId);
  await queueRef.delete();
};

module.exports = {
  getAllQueues,
  addBusToQueue,
  updateQueue,
  deleteQueue
};