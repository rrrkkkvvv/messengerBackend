const { v2: cloudinary } = require("cloudinary");
const pkg = require("dotenv");

pkg.config();

const dotenvVars = {
  port: process.env.PORT,
  dbHost: process.env.DB_HOST,
  jwtSecret: process.env.JWT_SECRET_KEY,
  googleClient: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
const corsConfig = {
  origin: [
    "https://messenger-frontend-swart.vercel.app",
    "http://localhost:5173",
  ],
};

cloudinary.config({
  cloud_name: dotenvVars.cloudinary.cloudName,
  api_key: dotenvVars.cloudinary.apiKey,
  api_secret: dotenvVars.cloudinary.apiSecret,
});

module.exports = { dotenvVars, corsConfig, cloudinary };
