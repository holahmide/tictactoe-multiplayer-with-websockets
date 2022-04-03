let user = "O";
let gameState = 0;
let gameWinner = null;
let opponent = null; // Set when the user starts the game

const setGame = (location) => {
  if (gameState == 1) {
    return setMessage(
      `<b>${gameWinner} already won the game, restart the game!</b>`
    );
  }

  if (gameState == 2) {
    return setMessage(`<b>The game ended as a draw, restart the game!</b>`);
  }

  if (document.getElementById(location).innerHTML.trim() != "") {
    return setMessage("You know you can't play there!!");
  }

  setTurn();

  if (user == "X") user = "O";
  else user = "X";

  document.getElementById(location).innerHTML = user;
  setMessage();
  checkWin();
  if (gameState == 0) checkDraw();
};

const setTurn = () => {
  document.getElementById("turn").innerHTML = `<b>It's ${user} turn</b>`;
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
    setMessage("<b>The game is a draw</b>");
    gameState = 2;
    return true;
  } else return false;
};

const setWinner = (winner) => {
  gameState = 1;
  gameWinner = winner;
  setMessage(`<b>The Winner is ${winner} </b>`);
  // cleardata();
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

const resetGame = () => {
  setMessage("<b>Starting a fresh game</b>");
  cleardata();
};