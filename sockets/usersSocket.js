const {
  createGroupConversation,
} = require("../controllers/conversationsWsController.js");
const {
  getConversations,
  deleteUserById,
  updateUserById,
} = require("../controllers/usersWsControllers.js");

const usersOnline = new Set();

const setupUsersWebSocket = async (socket) => {
  const user = socket.user;
  try {
    socket.on("getUsersData", async () => {
      usersOnline.add(user.email);

      const otherUsers = await getConversations(user.id);

      socket.emit("usersData", {
        users: otherUsers,
        usersOnline: Array.from(usersOnline),
      });

      socket.broadcast.emit("usersOnlineUpdate", Array.from(usersOnline));
      socket.join(`user_${user._id}`);
    });

    socket.on("deleteUser", async () => {
      await deleteUserById(user.id);
      socket.broadcast.emit("userDeleted", user.id);
    });

    socket.on("updateUser", async ({ updatedProfile }) => {
      await updateUserById(updatedProfile);
      socket.broadcast.emit("userUpdated", updatedProfile);
    });
    socket.on(
      "createGroupConversation",
      async ({ name, userIds, creatorId }) => {
        const newGroupConvesation = await createGroupConversation(
          name,
          userIds,
          creatorId
        );

        socket.emit("newGroupWithUser", newGroupConvesation);
        userIds.forEach((userId) => {
          socket
            .to(`user_${userId}`)
            .emit("newGroupWithUser", newGroupConvesation);
        });
      }
    );
    socket.on("disconnect", () => {
      if (user) {
        usersOnline.delete(user.email);
        socket.broadcast.emit("usersOnlineUpdate", Array.from(usersOnline));
        socket.disconnect();
      }
    });
  } catch (err) {
    socket.emit("unauthorized", { message: "Invalid token" });
    socket.disconnect();
  }
};

module.exports = setupUsersWebSocket;
