const waitingPlayersList = document.getElementById("waiting-players");
const gameDiv = document.getElementById("game-div");
const roomDiv = document.getElementById("room-div");
const opponentDetailsContainer = document.getElementById("opponent-details");
const messageDiv = document.getElementById("message-div");
const cancelGameDiv = document.getElementById("cancel-game-div");
const restartGameButton = document.getElementById("restart-game-btn");
const endGameButton = document.getElementById("end-game-btn");
const userDiv = document.getElementById("user-div");
let waitingList = [];

// Get Username from url
const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Initialize socket
const socket = io();

// When a new player joins
socket.emit("newPlayer", { username });
userDiv.innerHTML = `<b>@${username}</b>`

// Update list of awaiting users
socket.on("updateWaitingPlayers", (players) => {
  updateWaitingPlayers(players);
  waitingList = players;
});

// When another player sends a request to play
socket.on("playRequest", (player) => {
  showConfirmPlayRequest(player);
});

// When the play request is confirmed
socket.on("startGame", (opponent) => {
  // The player that requested the game will be denoted as "X"
  if (opponent.denotation == "O") { // To be sure this user requested the game
    Swal.fire({
      allowOutsideClick: false,
      title: `${opponent.username} accepted your request!`,
      showDenyButton: true,
      confirmButtonText: 'Start Game',
      denyButtonText: `Cancel`,
    }).then((result) => {
      if (result.isConfirmed) {
        startGame(opponent);
      } else if (result.isDenied) {
        confirmEndGame(opponent.id);
      }
    })
  } else startGame(opponent);
});

// When one of the user updates the game
socket.on("updateGame", ({ id, location }) => {
  updateGame(location);
});

// When one of the user restarts the game
socket.on("restartGame", () => {
  resetGame(true);
});

// When one of the user ends game
socket.on("endGame", () => {
  goBackToGameRoom();
});

// When a player disrupts the game e.g reloads
socket.on("disruptGame", () => {
  goBackToGameRoom();
});

const updateWaitingPlayers = (players) => {
  players = players.filter(player => player.id != socket.id);
  if (players.length == 0) {
    return waitingPlayersList.innerHTML = `Hmmm.. seems like there is no one here, tell a friend to join <a style="color:blue" href="http://tic-tac-toe.aolamide.com" target="_blank">http://tic-tac-toe.aolamide.com</a>`
  }
  waitingPlayersList.innerHTML = `
    ${players
      .map(
        (player) =>
          `<div
          class="flex items-center justify-between mb-2 bg-blue-500 text-white text-sm font-bold px-4 py-3"
          role="alert"
        >
          <div class="flex items-center">
            <svg
              class="fill-current w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
              />
            </svg>
            <p>${player.username}</p>
          </div>

          <button
          onClick="sendRequestToPlayer('${player.id}', this)" class="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Request
          </button>
        </div>`
      )
      .join("")}`;
};

const sendRequestToPlayer = (id, e) => {
  e.disabled = true
  e.innerHTML = "Requested"
  const player = waitingList.find((el) => el.id === id);
  socket.emit("makePlayRequest", { id });
};

const showConfirmPlayRequest = ({ id, username }) => {
  messageDiv.innerHTML += `
    <div
      class="mb-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold capitalize"
        >${username}</strong
      ><span class="block sm:inline">&nbsp;wants to play with you</span> <br>
      <button
        class="bg-green-900 hover:bg-green-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button" 
        onClick="confirmPlayRequest('${id}')"
      >
        Accept
      </button>
      <button
        class="bg-red-900 hover:bg-red-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
        onClick="rejectPlayer(this)"
      >
        Reject
      </button>
    </div>`;
};

const confirmPlayRequest = (id) => {
  socket.emit("confirmPlayRequest", { id });
};

const startGame = (opponent) => {
  player_1 = {
    id: null,
    username,
    is_opponent: false,
    denotation: opponent.denotation == "X" ? "O" : "X",
  };
  player_2 = {
    id: opponent.id,
    username: opponent.username,
    is_opponent: true,
    denotation: opponent.denotation,
  };
  gameDiv.style.display = "block";
  roomDiv.style.display = "none";
  messageDiv.style.display = "none";
  endGameButton.addEventListener("click", function () {
    confirmEndGame(opponent.id);
  });
  setTurn();
  opponentDetailsContainer.innerHTML = `
    <b>You</b> (${player_1.denotation}) vs <span class="capitalize"><b>${opponent.username}</b></span> (${player_2.denotation})`;
};

const updateGame = (location) => {
  setGame(location, true);
};

const confirmEndGame = (id = player_2.id) => {
  Swal.fire({
    title: `Are you sure you want to end this game?`,
    showCancelButton: true,
    confirmButtonText: 'End Game',
  }).then((result) => {
    if (result.isConfirmed) {
      socket.emit("endGame", { id });
    }
  })
};

const goBackToGameRoom = () => {
  gameDiv.style.display = "none";
  roomDiv.style.display = "none";
  cancelGameDiv.style.display = "block";
};

const goBackToHomePage = () => {
  window.location.replace('/');
}

const rejectPlayer = (e) => {
  e.parentNode.style.display='none';
}