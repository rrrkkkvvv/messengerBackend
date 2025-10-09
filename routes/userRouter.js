const express = require("express");
const { updateProfileSchema } = require("../models/User.js");
const validateBody = require("../helpers/validateBody.js");
const authenticate = require("../middlewares/authenticate.js");

const {
  deleteUserById,
  updateProfile,
} = require("../controllers/usersWsControllers.js");

const userRouter = express.Router();

userRouter.delete("/deleteAccount", authenticate, deleteUserById);
userRouter.patch(
  "/updateAccount",
  authenticate,
  validateBody(updateProfileSchema),
  updateProfile
);

module.exports = userRouter;
