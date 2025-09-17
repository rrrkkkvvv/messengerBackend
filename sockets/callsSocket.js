const setupCallWebSocket = async (socket, io) => {
  const { _id } = socket.user;
  socket.on("joinCallsSocket", () => {
    socket.join(`calls_${_id}`);
  });
  // socket.on("disconnect", () => {
  //   socket.broadcast.emit("callEnded");
  // });
  socket.on("iceCandidate", (data) => {
    io.of("/calls")
      .to(`calls_${data.to}`)
      .emit("iceCandidate", {
        ...data,
      });
  });
  socket.on("callUser", (data) => {
    io.of("/calls").to(`calls_${data.to}`).emit("incomingCall", {
      sdp: data.sdp,
      from: data.from,
    });
  });

  socket.on("answerCall", (data) => {
    io.of("/calls")
      .to(`calls_${data.to}`)
      .emit("callAccepted", { sdp: data.sdp, from: data.from });
  });
  socket.on("endCall", (data) => {
    io.of("/calls").to(`calls_${data.callWith}`).emit("callEnded");
  });
};

module.exports = setupCallWebSocket;
