const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const PORT = 3000 || process.env.PORT;
const {
  createNewPlayer,
  getWaitingPlayers,
  removePlayer,
  getPlayer,
} = require("./utils/players");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// When the player connects or load the page
io.on("connection", (socket) => {
  // Create a new player when player connects
  socket.on("newPlayer", ({ username }) => {
    createNewPlayer({
      id: socket.id,
      username,
      isPlaying: false,
    });

    // Update awating players for every user
    io.emit("updateWaitingPlayers", getWaitingPlayers());
  });

  // On new request to play
  socket.on("makePlayRequest", ({ id }) => {
    const user = getPlayer(id);
    if (user) {
      socket.broadcast.to(id).emit("playRequest", getPlayer(socket.id));
    }
  });

  // confirm request to play and start game for both players
  socket.on("confirmPlayRequest", ({ id }) => {
    const user = getPlayer(id);
    if (user) {
      io.to(id).emit("startGame", getPlayer(socket.id));
      io.to(socket.id).emit("startGame", user);
    }
  });

  // when the user ends the game
  socket.on("endGame", ({ id }) => {
    const user = getPlayer(id);
    if (user) {
      io.to(id).emit("endGame", getPlayer(socket.id));
      io.to(socket.id).emit("endGame", user);
    }
  });

  // When player disconnects
  socket.on("disconnect", () => {
    const user = removePlayer(socket.id);

    if (user) {
      // Update awating players for every user
      io.emit("updateWaitingPlayers", getWaitingPlayers());
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
