const express = require("express");
const { updateProfileSchema } = require("../models/User.js");
const validateBody = require("../helpers/validateBody.js");
const authenticate = require("../middlewares/authenticate.js");

const {
  updateProfile,
  deleteAccount,
} = require("../controllers/rest/userControllers.js");
const upload = require("../helpers/multerUploader.js");

const userRouter = express.Router();

userRouter.delete("/deleteAccount", authenticate, deleteAccount);
userRouter.patch(
  "/updateProfile",
  authenticate,
  // validateBody(updateProfileSchema),
  upload.fields([{ name: "updatedAvatar", maxCount: 1 }]),
  updateProfile
);

module.exports = userRouter;
