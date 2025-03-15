const { User } = require("../models/User");

const getUserById = async (id) => {
  return await User.findById(id);
};

const getOtherUsers = async (id) => {
  return await User.find({ _id: { $ne: id } });
};
const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};
const updateUserById = async (updatedProfile) => {
  return await User.findByIdAndUpdate(updatedProfile._id, updatedProfile);
};

module.exports = {
  getUserById,
  getOtherUsers,
  deleteUserById,
  updateUserById,
};
