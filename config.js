const pkg = require("dotenv");

pkg.config();

const dotenvVars = {
  port: process.env.PORT,
  dbHost: process.env.DB_HOST,
  jwtSecret: process.env.JWT_SECRET_KEY,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
};
const corsConfig = {
  origin: [
    "https://messenger-frontend-5w6t56640-romans-projects-c17effd1.vercel.app/auth",
    "http://localhost:5173",
  ],
};
module.exports = { dotenvVars, corsConfig };
