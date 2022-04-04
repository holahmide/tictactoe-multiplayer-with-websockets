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
  updatePlayer,
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
      opponent: null
    });

    // Update awating players for every user
    io.emit("updateWaitingPlayers", getWaitingPlayers(socket.id));
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
    const opponent = getPlayer(id);
    const user = getPlayer(socket.id);

    if (opponent) {
      if (opponent.isPlaying) {
        return io.to(socket.id).emit("endGame", opponent);
      }
      // update users playing status
      updatePlayer({...opponent, isPlaying: true, opponent: user.id})
      updatePlayer({...user, isPlaying: true, opponent: opponent.id})
      io.to(id).emit("startGame", { ...user, denotation: "O" });
      io.to(socket.id).emit("startGame", { ...opponent, denotation: "X" });
    }
  });

  // when the user updates the game
  socket.on("updateGame", ({ id, location }) => {
    const user = getPlayer(id);
    if (user) {
      io.to(id).emit("updateGame", { location });
    }
  });

  // when the user updates the game
  socket.on("restartGame", ({ id }) => {
    const user = getPlayer(id);
    if (user) {
      io.to(id).emit("restartGame");
    }
  });

  // when the user ends the game
  socket.on("endGame", ({ id }) => {
    const user = getPlayer(socket.id);
    const opponent = getPlayer(id);
    if (opponent) {
      updatePlayer({...opponent, isPlaying: false, opponent: null})
      // updatePlayer({...user, isPlaying: false, opponent: null})
      io.to(id).emit("endGame", user);
      io.to(socket.id).emit("endGame", opponent);
    }
  });

  // When player disconnects
  socket.on("disconnect", () => {
    const user = removePlayer(socket.id);

    if (user && user[0]) {
      if (user[0].opponent) {
        io.to(user[0].opponent).emit("disruptGame")
      }
      // Update awating players for every user
      io.emit("updateWaitingPlayers", getWaitingPlayers());
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
