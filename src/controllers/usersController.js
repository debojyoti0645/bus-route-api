const {
  getAllUsers,
  findUserById,
  updateUser,
  deleteUser,
} = require("../services/userService");

const listAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    console.log(`Received update request for user: ${userId}`);
    console.log("Update data received:", updateData);

    // First check if user exists
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      console.log(`User ${userId} not found during existence check`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User ${userId} exists, proceeding with update`);
    await updateUser(userId, updateData);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error in updateUserDetails:", error);
    if (error.message.includes("User not found")) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // First check if user exists
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await deleteUser(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.message.includes("User not found")) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listAllUsers,
  getUserById,
  updateUserDetails,
  deleteUserById,
};
