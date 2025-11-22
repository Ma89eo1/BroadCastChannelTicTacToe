// === Full-page Multiplayer Tic-Tac-Toe via BroadcastChannel ===

const channel = new BroadcastChannel("gameChannel");
const playerId = "Player-" + Math.floor(Math.random() * 1000);

let gameState = {
  board: Array(9).fill(null),
  currentTurn: "X",
  players: {}
};

// --- DOM Setup ---
document.body.innerHTML = ""; // clear page
document.body.style.margin = "0";
document.body.style.height = "100vh";
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.alignItems = "center";
document.body.style.justifyContent = "center";
document.body.style.background = "#222";
document.body.style.color = "#fff";
document.body.style.fontFamily = "Arial, sans-serif";

const statusEl = document.createElement("div");
statusEl.id = "status";
statusEl.style.margin = "20px";
statusEl.style.fontSize = "24px";
statusEl.textContent = "Join as X or O";

const joinXBtn = document.createElement("button");
joinXBtn.textContent = "Join as X";
joinXBtn.style.margin = "5px";
joinXBtn.onclick = () => joinGame("X");

const joinOBtn = document.createElement("button");
joinOBtn.textContent = "Join as O";
joinOBtn.style.margin = "5px";
joinOBtn.onclick = () => joinGame("O");

const btnContainer = document.createElement("div");
btnContainer.appendChild(joinXBtn);
btnContainer.appendChild(joinOBtn);

const boardEl = document.createElement("div");
boardEl.id = "board";
boardEl.style.display = "grid";
boardEl.style.gridTemplateColumns = "repeat(3, 120px)";
boardEl.style.gridGap = "10px";

document.body.appendChild(statusEl);
document.body.appendChild(btnContainer);
document.body.appendChild(boardEl);

// Build cells
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.style.width = "120px";
  cell.style.height = "120px";
  cell.style.border = "2px solid #fff";
  cell.style.fontSize = "64px";
  cell.style.textAlign = "center";
  cell.style.lineHeight = "120px";
  cell.style.cursor = "pointer";
  cell.dataset.index = i;
  cell.onclick = () => makeMove(i);
  boardEl.appendChild(cell);
}

// --- BroadcastChannel Handling ---
channel.onmessage = (event) => {
  const { type, payload } = event.data;
  switch (type) {
    case "join":
      gameState.players[payload.id] = payload.symbol;
      updateStatus(`${payload.id} joined as ${payload.symbol}`);
      break;
    case "move":
      if (!gameState.board[payload.index]) {
        gameState.board[payload.index] = payload.symbol;
        gameState.currentTurn = payload.symbol === "X" ? "O" : "X";
        renderBoard();
        checkWinner();
      }
      break;
    case "state":
      gameState = payload;
      renderBoard();
      break;
  }
};

// --- Functions ---
function joinGame(symbol) {
  channel.postMessage({ type: "join", payload: { id: playerId, symbol } });
  gameState.players[playerId] = symbol;
  updateStatus(`You joined as ${symbol}`);
}

function makeMove(index) {
  const symbol = gameState.players[playerId];
  if (!symbol) {
    updateStatus("Join the game first!");
    return;
  }
  if (gameState.currentTurn === symbol && !gameState.board[index]) {
    // Update locally
    gameState.board[index] = symbol;
    gameState.currentTurn = symbol === "X" ? "O" : "X";
    renderBoard();
    checkWinner();
    // Broadcast move
    channel.postMessage({ type: "move", payload: { index, symbol } });
  }
}

function renderBoard() {
  document.querySelectorAll("#board .cell").forEach((cell, i) => {
    cell.textContent = gameState.board[i] || "";
  });
  updateStatus("Current turn: " + gameState.currentTurn);
}

function updateStatus(msg) {
  statusEl.textContent = msg;
}

function checkWinner() {
  const b = gameState.board;
  const wins = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
  ];
  for (const [a,b1,c] of wins) {
    if (gameState.board[a] &&
        gameState.board[a] === gameState.board[b1] &&
        gameState.board[a] === gameState.board[c]) {
      updateStatus(`Winner: ${gameState.board[a]}!`);
      // Disable further moves
      document.querySelectorAll("#board .cell").forEach(cell => cell.onclick = null);
      return true;
    }
  }
  return false;
}