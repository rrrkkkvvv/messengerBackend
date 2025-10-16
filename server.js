const { app, io, server } = require("./app.js");
const authRouter = require("./routes/authRouter.js");
const userRouter = require("./routes/userRouter.js");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const setupUsersWebSocket = require("./sockets/usersSocket.js");
const authenticateWebSocket = require("./middlewares/authenticateWebSocket.js");
const setupConversationsWebSocket = require("./sockets/conversationSocket.js");
const setupCallWebSocket = require("./sockets/callsSocket.js");
const { dotenvVars, corsConfig } = require("./config.js");
const conversationRouter = require("./routes/conversationRouter.js");
require("./helpers/multerUploader.js");

const { port, host, dbHost } = dotenvVars;

app.use(cors(corsConfig));

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/conversations", conversationRouter);
app.use(express.json());
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message: message });
});

// app.use("/auth", authRouter);
// app.use("/user", userRouter);
const usersNamespace = io.of("/users");
const conversationsNamespace = io.of("/conversations");
const callsNamespace = io.of("/calls");

conversationsNamespace.use(authenticateWebSocket);
callsNamespace.use(authenticateWebSocket);
usersNamespace.use(authenticateWebSocket);

conversationsNamespace.on("connection", (socket) =>
  setupConversationsWebSocket(socket, io)
);
callsNamespace.on("connection", (socket) => setupCallWebSocket(socket, io));
usersNamespace.on("connection", setupUsersWebSocket);

mongoose
  .connect(dbHost)
  .then(async () => {
    server.listen(port, host, async () => {
      console.log(`Server running at http://${host}:${port}/`);
    });
  })
  .catch((err) => {
    console.log(`Error connection db ${err}`);
    process.exit(1);
  });
