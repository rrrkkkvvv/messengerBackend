const express = require("express");
const {
  signUpSchema,
  signInSchema,
  googleAuthSchema,
} = require("../models/User");
const validateBody = require("../helpers/validateBody");
const authenticate = require("../middlewares/authenticate");
const {
  signIn,
  logout,
  signUp,
  refresh,
  googleAuth,
} = require("../controllers/authControllers");

const authRouter = express.Router();

authRouter.post("/signUp", validateBody(signUpSchema), signUp);
authRouter.post("/signIn", validateBody(signInSchema), signIn);
authRouter.post("/googleAuth", validateBody(googleAuthSchema), googleAuth);
authRouter.post("/logout", authenticate, logout);
authRouter.post("/refresh", authenticate, refresh);

module.exports = authRouter;
