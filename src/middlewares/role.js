const checkRole = (allowedRoles) => (req, res, next) => {
  // `req.user.role` is set by the `verifyToken` middleware
  const userRole = req.user.role;
  if (!userRole || !allowedRoles.some(role => role.toLowerCase() === userRole.toLowerCase())) {
    return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
  }
  next();
};

module.exports = checkRole;