const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/authRouter.js");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/auth", authRouter);
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message: message });
});

module.exports = app;
