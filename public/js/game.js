let currentPlayer = "X";
let gameState = 0; // 1: Win, 2: Draw
let gameWinner = null;
let player_1 = {}; // user
let player_2 = {}; // opponent
let score = { player_1: 0, player_2: 0 };

const setGame = (location, socketTriggered = false) => {
  // check if its user's turn
  if (gameState == 1) {
    return setMessage(
      `<b>${
        gameWinner == player_1.denotation ? "You" : player_2.username
      } already won the game, restart the game!</b>`
    );
  }

  if (!socketTriggered) {
    if (player_1.denotation != currentPlayer)
      return setMessage(`Its not your turn!`);
  }

  if (gameState == 2) {
    return setMessage(`<b>The game ended as a draw, restart the game!</b>`);
  }

  if (document.getElementById(location).innerHTML.trim() != "") {
    return 
  }

  // Emit gameUpdate
  socket.emit("updateGame", {
    id: player_2.id,
    location,
  });

  displayCellValue(location);

  switchTurn();

  setTurn();

  setMessage();
  checkWin();
  if (gameState == 0) checkDraw();
};

const switchTurn = () => {
  if (currentPlayer == "X") currentPlayer = "O";
  else currentPlayer = "X";
};

const displayCellValue = (location, value = currentPlayer) => {
  if (location) document.getElementById(location).innerHTML = value;
};

const setTurn = (afterWinOrDraw = false) => {
  if (afterWinOrDraw) {
    document.getElementById(
      "turn"
    ).innerHTML = `<p>Restart game and continue with previous turn<p>`;
  } else
    document.getElementById("turn").innerHTML = `<p><b>It's ${
      player_1.denotation == currentPlayer ? "your" : player_2.username + "'s"
    } turn, waiting...</b><p>`;
};

const setMessage = (message) => {
  if (!message) message = "Hmmm. Keep on playing!";
  document.getElementById("game-alert").innerHTML = `Nb: ${message}`;
};

const checkWin = () => {
  countX = 0;
  countO = 0;

  for (var i = 1; i <= 3; i++) {
    for (var j = 1, countX = 0, countO = 0; j <= 3; j++) {
      if (document.getElementById(`${i},${j}`).innerHTML == "X") countX++;
      else if (document.getElementById(`${i},${j}`).innerHTML == "O") countO++;
    }
    if (countX == 3) return setWinner("X");
    else if (countO == 3) return setWinner("O");

    for (var j = 1, countX = 0, countO = 0; j <= 3; j++) {
      if (document.getElementById(`${j},${i}`).innerHTML == "X") countX++;
      else if (document.getElementById(`${j},${i}`).innerHTML == "O") countO++;
    }
    if (countX == 3) return setWinner("X");
    else if (countO == 3) return setWinner("O");
  }

  if (
    document.getElementById(`1,1`).innerHTML ==
      document.getElementById(`2,2`).innerHTML &&
    document.getElementById(`2,2`).innerHTML ==
      document.getElementById(`3,3`).innerHTML &&
    document.getElementById(`1,1`).innerHTML.trim() != ""
  ) {
    return setWinner(document.getElementById(`1,1`).innerHTML);
  }

  if (
    document.getElementById(`1,3`).innerHTML ==
      document.getElementById(`2,2`).innerHTML &&
    document.getElementById(`2,2`).innerHTML ==
      document.getElementById(`3,1`).innerHTML &&
    document.getElementById(`1,3`).innerHTML.trim() != ""
  ) {
    return setWinner(document.getElementById(`1,1`).innerHTML);
  }
};

const checkDraw = () => {
  let count = 0;
  for (var i = 1; i <= 3; i++) {
    for (var j = 1, countX = 0, countO = 0; j <= 3; j++) {
      if (document.getElementById(`${i},${j}`).innerHTML.trim() != "") {
        count++;
      }
    }
  }
  if (count == 9) {
    gameState = 2;
    setMessage("<b>The game is a draw</b>");
    setTurn(true); // onDraw is true
    showWinOrDrawPopup("draw");
    return true;
  } else return false;
};

const showWinOrDrawPopup = (status) => {
  Swal.fire({
    title: `${(status == "draw" ? "The game was a draw!" : (player_1.denotation == gameWinner ? player_1.username : player_2.username) + " won the game")}`,
    showDenyButton: true,
    confirmButtonText: "End Game",
    denyButtonText: `Cancel`,
  }).then((result) => {
    if (result.isConfirmed) {
      confirmEndGame();
    }
  });
};

const setWinner = (winner) => {
  gameState = 1;
  gameWinner = winner;
  showWinOrDrawPopup("win");
  setMessage(
    `<b>${
      winner == player_1.denotation ? "You" : player_2.username
    } won the game </b>`
  );
  if (winner == player_1.denotation) {
    score.player_1++;
  } else {
    score.player_2++;
  }
  updateScore();
  setTurn(true); // onWin is true
};

const updateScore = () => {
  document.getElementById(
    "score"
  ).innerHTML = `<b>${score.player_1} : ${score.player_2}`;
};

const cleardata = () => {
  for (var i = 1; i <= 3; i++) {
    for (var j = 1, countX = 0, countO = 0; j <= 3; j++) {
      document.getElementById(`${i},${j}`).innerHTML = "";
    }
  }
  gameState = 0;
  gameWinner = null;
};

const confirmResetGame = () => {
  Swal.fire({
    title: `Are you sure you want to restart the game`,
    showDenyButton: true,
    confirmButtonText: "Restart Game",
    denyButtonText: `Cancel`,
  }).then((result) => {
    if (result.isConfirmed) {
      resetGame();
    }
  });
};

const resetGame = (socketTriggered = false) => {
  setMessage("<b>Starting a fresh game</b>");
  cleardata();
  setTurn();
  if (!socketTriggered) socket.emit("restartGame", { id: player_2.id });
};
