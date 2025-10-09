const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app.js");
const { dotenvVars, corsConfig } = require("./config.js");
const setupUsersWebSocket = require("./sockets/usersSocket.js");
const authenticateWebSocket = require("./middlewares/authenticateWebSocket.js");
const setupConversationsWebSocket = require("./sockets/conversationSocket.js");
const setupCallWebSocket = require("./sockets/callsSocket.js");

const { port, host, dbHost } = dotenvVars;

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsConfig,
});

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
module.exports = {
  io,
};
