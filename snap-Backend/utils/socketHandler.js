let rooms = {}; // Track participants per room

function socketHandler(socket, io) {
  console.log(`📡 User connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    const otherUser = rooms[roomId].find(id => id !== socket.id);
    if (otherUser) {
      socket.emit("other-user", otherUser);            // Tell new user about existing
      socket.to(otherUser).emit("user-joined", socket.id); // Tell existing about new user
    }

    socket.roomId = roomId; // Track room on socket
  });

  // Offer
  socket.on("sending-signal", ({ userToSignal, callerId, signal }) => {
    io.to(userToSignal).emit("signal", { signal, callerId });
  });

  // Answer
  socket.on("returning-signal", ({ signal, to }) => {
    io.to(to).emit("signal", { signal, callerId: socket.id });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
}

module.exports = socketHandler;
