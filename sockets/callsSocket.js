const setupCallWebSocket = async (socket, io) => {
  const { _id } = socket.user;
  socket.on("joinCallsSocket", () => {
    socket.join(`calls_${_id}`);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });
  socket.on("callUser", (data) => {
    io.of("/calls").to(`calls_${data.userToCall}`).emit("callUser", {
      signal: data.signalData,
      from: data.from,
    });
  });
  socket.on("answerCall", (data) => {
    io.of("/calls").to(`calls_${data.to}`).emit("callAccepted", data.signal);
  });
};

module.exports = setupCallWebSocket;
