const waitingPlayersList = document.getElementById("waiting-players");
const message = document.getElementById("message");
const gameDiv = document.getElementById("game-div");
const opponent = document.getElementById("opponent-details");
const waitingPlayersDiv = document.getElementById("waiting-players-div");
const requestsDiv = document.getElementById("requests-sent-div");
const messageDiv = document.getElementById("message-div");
const cancelGameDiv = document.getElementById("cancel-game-div");


// Get Username from url
const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// When a new player joins
socket.emit("newPlayer", { username });

// Update list of awaiting users
socket.on("updateWaitingPlayers", (players) => {
    updateWaitingPlayers(players)
    console.log(players)
})

// When another player sends a request to play
socket.on("playRequest", (player) => {
    showConfirmPlayRequest(player);
})

// When the play request is confirmed
socket.on("startGame", (opponent) => {
    startGame(opponent);
})

// When one of the user ends game
socket.on("endGame", () => {
    goBackToGameRoom();
})


const updateWaitingPlayers = (players) => {
    waitingPlayersList.innerHTML= `
    ${players.map(player => `<li>${player.username}<button onClick="sendRequestToPlayer('${player.id}')">Play</button></li>`).join("")}`;
}

const sendRequestToPlayer = (id) => {
    socket.emit("makePlayRequest", { id });
}

const showConfirmPlayRequest = ({id, username}) => {
    message.innerHTML= `
    <b>${username}</b> wants to play with you <button onClick="confirmPlayRequest('${id}')">Confirm</button></li>`;
}

const confirmPlayRequest = (id) => {
    socket.emit("confirmPlayRequest", { id });
}

const startGame = ({id, username}) => {
    opponent = username; // Set the name of the opponent
    gameDiv.style.display = "block";
    waitingPlayersDiv.style.display = "none";
    requestsDiv.style.display = "none";
    messageDiv.style.display = "none";
    opponent.innerHTML= `
    You are playing with <b>${username}</b><button onClick="confirmEndGame('${id}')">End Game</button></li>`;
}

const confirmEndGame = (id) => {
    socket.emit("endGame", { id });
}

const goBackToGameRoom = () => {
    gameDiv.style.display = "none";
    cancelGameDiv.style.display = "block";
}

