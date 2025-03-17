const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app.js");
const { dotenvVars, corsConfig } = require("./config.js");
const setupUsersWebSocket = require("./sockets/usersSocket.js");
const authenticateWebSocket = require("./middlewares/authenticateWebSocket.js");
const setupConversationsWebSocket = require("./sockets/conversationSocket.js");

const { port, dbHost } = dotenvVars;

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsConfig,
});

const usersNamespace = io.of("/users");
const conversationsNamespace = io.of("/conversations");

conversationsNamespace.use(authenticateWebSocket);
usersNamespace.use(authenticateWebSocket);
conversationsNamespace.on("connection", setupConversationsWebSocket);
usersNamespace.on("connection", setupUsersWebSocket);

mongoose
  .connect(dbHost)
  .then(async () => {
    server.listen(port, async () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Error connection db ${err}`);
    process.exit(1);
  });
