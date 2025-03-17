const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { jwtSecret, googleClientId } = require("../config.js");
const HttpError = require("../helpers/HttpError.js");
const controllersWrapper = require("../helpers/controllersWrapper.js");
const { User } = require("../models/User.js");
const { OAuth2Client } = require("google-auth-library");

const signUp = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
  });
  const payload = { id: newUser._id };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: "10h" });
  await User.findByIdAndUpdate(newUser._id, { token });

  res.status(201).json({
    code: 201,
    status: "success",
    data: {
      token: token,
      email: newUser.email,
      name: newUser.name,
    },
  });
};
const signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = { id: user._id };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: "10h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    code: 200,
    status: "success",
    data: {
      token: token,
    },
  });
};
const googleAuth = async (req, res) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) {
      throw HttpError(400, "No Google token provided");
    }

    const client = new OAuth2Client(googleClientId);

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: googleClientId,
    });

    const { sub, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      const payload = { email, name, avatarURL: picture, googleId: sub };
      user = await User.create(payload);
    }

    const tokenPayload = { id: user._id };
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "10h" });

    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      code: 200,
      status: "success",
      data: { user, token },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    throw HttpError(401, "Invalid Google token");
  }
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(200).json({
    code: 200,
    status: "Logout success",
    data: {},
  });
};
const refresh = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select("-password -token");

  if (!user) {
    throw HttpError(404, "User not found");
  }

  res.status(200).json({
    code: 200,
    status: "success",
    data: { user },
  });
};
module.exports = {
  googleAuth: controllersWrapper(googleAuth),
  signUp: controllersWrapper(signUp),
  signIn: controllersWrapper(signIn),
  logout: controllersWrapper(logout),
  refresh: controllersWrapper(refresh),
};
