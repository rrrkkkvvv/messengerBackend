const {
  createGroupConversation,
} = require("../services/conversationService.js");
const { getConversations } = require("../controllers/userControllers.js");

const usersOnline = new Set();

const setupUsersWebSocket = async (socket) => {
  const user = socket.user;
  try {
    socket.on("getUsersData", async () => {
      usersOnline.add(user._id.toString());

      const otherUsers = await getConversations(user._id);

      socket.emit("usersData", {
        users: otherUsers,
        usersOnline: Array.from(usersOnline),
      });

      socket.broadcast.emit("usersOnlineUpdate", Array.from(usersOnline));
      socket.join(`user_${user._id}`);
    });

    socket.on("disconnect", () => {
      if (user) {
        usersOnline.delete(user._id.toString());
        socket.broadcast.emit("usersOnlineUpdate", Array.from(usersOnline));
        socket.disconnect();
      }
    });
  } catch (err) {
    socket.emit("unauthorized", { message: "Invalid token" });
    socket.disconnect();
  }
};

module.exports = { setupUsersWebSocket, usersOnline };
