const pkg = require("dotenv");

pkg.config();

const dotenvVars = {
  port: process.env.PORT,
  dbHost: process.env.DB_HOST,
  jwtSecret: process.env.JWT_SECRET_KEY,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

module.exports = dotenvVars;
