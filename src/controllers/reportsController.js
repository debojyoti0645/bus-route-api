const { getTripsReport, getEarningsReport } = require('../services/reportService');

const getTrips = async (req, res) => {
  const { date, routeId } = req.query;
  try {
    const report = await getTripsReport({ date, routeId });
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEarnings = async (req, res) => {
  const { date, ownerId } = req.query;
  try {
    const report = await getEarningsReport({ date, ownerId });
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTrips,
  getEarnings
};