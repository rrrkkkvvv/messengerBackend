const jwt = require("jsonwebtoken");
const { getUserById } = require("../controllers/usersWsControllers");
const { jwtSecret } = require("../config");

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
