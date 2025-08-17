const authService = require("../services/authService");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  // Only require password, name, role, and phone (ID will be auto-generated)
  const { password, name, role, phone, assignedBuses, status } = req.body;

  if (!password || !name || !role) {
    return res.status(400).json({
      message: "Missing required fields: password, name, or role",
    });
  }

  try {
    const userId = await authService.registerUser(password, {
      name,
      role,
      phone,
      assignedBuses,
      status,
    });
    res.status(201).json({
      message: "User registered successfully",
      userId: userId,
      generatedId: userId, // Return the auto-generated ID
    });
  } catch (error) {
    console.error(error);
    if (error.message === "User ID conflict occurred") {
      return res
        .status(409)
        .json({ message: "User ID generation conflict occurred" });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await authService.loginUser(id, password);

    // If login is successful, generate a JWT token
    // The userId in the token's payload should be the unique 'id' field
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "12h" }
    );

    res.json({ token, role: user.role, userId: user.id });
  } catch (error) {
    console.error(error);
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(500).json({ message: "Server error during login" });
  }
};

const getMe = async (req, res) => {
  try {
    // User data is already attached to req.user by the verifyToken middleware
    const userData = {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      phone: req.user.phone,
      status: req.user.status,
      assignedBuses: req.user.assignedBuses || [],
    };

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
