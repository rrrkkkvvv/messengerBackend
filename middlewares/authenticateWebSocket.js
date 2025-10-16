const jwt = require("jsonwebtoken");
const { getUserById } = require("../controllers/rest/userControllers.js");
const { dotenvVars } = require("../config.js");
const { jwtSecret } = dotenvVars;

const authenticateWebSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const { id: userId } = jwt.verify(token, jwtSecret);

    const user = await getUserById(userId);

    if (!user) {
      socket.emit("unauthorized", { message: "Unauthorized" });
      return socket.disconnect();
    }

    socket.user = user;
    next();
  } catch {
    socket.emit("unauthorized", { message: "Invalid token" });
    socket.disconnect();
  }
};
module.exports = authenticateWebSocket;
