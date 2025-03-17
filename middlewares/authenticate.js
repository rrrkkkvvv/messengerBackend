const jwt = require("jsonwebtoken");
const { dotenvVars } = require("../config.js");
const { User } = require("../models/User.js");
const HttpError = require("../helpers/HttpError.js");
const { jwtSecret } = dotenvVars;

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return next(HttpError(401));

  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    next(HttpError(401));
  }
  try {
    const { id } = jwt.verify(token, jwtSecret);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      next(HttpError(401));
    }
    req.user = user;
    next();
  } catch {
    next(HttpError(401));
  }
};
module.exports = authenticate;
