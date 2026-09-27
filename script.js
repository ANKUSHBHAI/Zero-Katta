 const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");

const pvpBtn = document.getElementById("pvpBtn");
const pvcBtn = document.getElementById("pvcBtn");
const resetBtn = document.getElementById("resetBtn");

const oScore = document.getElementById("oScore");
const xScore = document.getElementById("xScore");

const roundText = document.getElementById("roundText");
const turnText = document.getElementById("turnText");
const board = document.getElementById("board");

const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageSub = document.getElementById("messageSub");

let gameMode = "pvp"; // Default mode
let cells = [];
let currentPlayer = "O";
let startingPlayer = "O";
let oWins = 0;
let xWins = 0;
let round = 1;
let gameOver = false;

/* Sound System */
let audioCtx = null;
function getAudioContext() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") { audioCtx.resume(); }
        return audioCtx;
    } catch (error) { return null; }
}

function makeTone(frequency, duration, volume) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    } catch (error) {}
}

function playButtonSound() {
    makeTone(600, 0.08, 0.10);
    setTimeout(() => makeTone(800, 0.12, 0.10), 80);
}
function playTapSound() { makeTone(700, 0.08, 0.08); }
function playWinSound() {
    makeTone(523, 0.15, 0.12);
    setTimeout(() => makeTone(659, 0.15, 0.12), 150);
    setTimeout(() => makeTone(784, 0.30, 0.12), 300);
}
function playDrawSound() {
    makeTone(440, 0.18, 0.10);
    setTimeout(() => makeTone(330, 0.25, 0.10), 180);
}
function playResetSound() {
    makeTone(500, 0.08, 0.08);
    setTimeout(() => makeTone(350, 0.12, 0.08), 80);
}

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

/* Player vs Player Button Click */
pvpBtn.addEventListener("click", function () {
    playButtonSound();
    gameMode = "pvp";
    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    startRound();
});

/* Player vs Computer Button Click */
pvcBtn.addEventListener("click", function () {
    playButtonSound();
    gameMode = "pvc";
    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    startRound();
});

function startRound() {
    gameOver = false;
    currentPlayer = startingPlayer;
    cells = ["", "", "", "", "", "", "", "", ""];

    roundText.textContent = "Round " + round;
    turnText.textContent = currentPlayer + "'s Turn";
    board.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.style.pointerEvents = "auto";
        cell.style.touchAction = "manipulation";

        cell.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            playMove(i);
        });

        board.appendChild(cell);
    }

    if (gameMode === "pvc" && currentPlayer === "X") {
        setTimeout(makeComputerMove, 400);
    }
}

function playMove(index) {
    if (gameOver) return;
    if (cells[index] !== "") return;

    cells[index] = currentPlayer;
    playTapSound();

    const cell = board.children[index];
    cell.textContent = currentPlayer;

    if (currentPlayer === "O") {
        cell.classList.add("o");
    } else {
        cell.classList.add("x");
    }

    const winningLine = checkWinner();
    if (winningLine) {
        finishWin(winningLine);
        return;
    }

    if (cells.every(value => value !== "")) {
        finishDraw();
        return;
    }

    currentPlayer = currentPlayer === "O" ? "X" : "O";
    turnText.textContent = currentPlayer + "'s Turn";

    if (gameMode === "pvc" && currentPlayer === "X" && !gameOver) {
        setTimeout(makeComputerMove, 400);
    }
}

function makeComputerMove() {
    if (gameOver) return;
    let move = getBestAiMove();
    if (move !== null) {
        playMove(move);
    }
}

/* ==========================================
   ADVANCED MINIMAX AI LOGIC (REPLACED)
   ========================================== */
function getBestAiMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < cells.length; i++) {
        if (cells[i] === "") {
            cells[i] = "X"; // AI is X
            let score = minimax(cells, 0, false);
            cells[i] = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(boardState, depth, isMaximizing) {
    // Check win conditions for Minimax
    let winner = checkWinnerForMinimax(boardState);
    if (winner === "X") return 10 - depth;
    if (winner === "O") return depth - 10;
    if (boardState.every(v => v !== "")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = "X";
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = "O";
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax(boardState) {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardState[a] !== "" && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return null;
}

function checkWinner() {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (cells[a] !== "" && cells[a] === cells[b] && cells[a] === cells[c]) {
            return pattern;
        }
    }
    return null;
}

function finishWin(winningLine) {
    gameOver = true;
    playWinSound();
    winningLine.forEach(index => {
        board.children[index].classList.add("win");
    });

    if (currentPlayer === "O") oWins++;
    else xWins++;

    updateScore();
    startingPlayer = currentPlayer;

    showMessage(currentPlayer + " Wins!", "Round " + round + " complete");

    setTimeout(() => {
        hideMessage();
        round++;
        startRound();
    }, 1300);
}

function finishDraw() {
    gameOver = true;
    playDrawSound();

    if (oWins > xWins) startingPlayer = "O";
    else if (xWins > oWins) startingPlayer = "X";

    showMessage("Draw!", "Round " + round + " complete");

    setTimeout(() => {
        hideMessage();
        round++;
        startRound();
    }, 1300);
}

function updateScore() {
    oScore.textContent = oWins + (oWins === 1 ? " Win" : " Wins");
    xScore.textContent = xWins + (xWins === 1 ? " Win" : " Wins");
}

function showMessage(title, sub) {
    messageTitle.textContent = title;
    messageSub.textContent = sub;
    message.classList.remove("hidden");
}

function hideMessage() {
    message.classList.add("hidden");
}

resetBtn.addEventListener("click", function () {
    playResetSound();
    oWins = 0;
    xWins = 0;
    round = 1;
    startingPlayer = "O";
    currentPlayer = "O";
    updateScore();
    startRound();
});

updateScore();
