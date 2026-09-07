const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");

const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");

const oScore = document.getElementById("oScore");
const xScore = document.getElementById("xScore");

const roundText = document.getElementById("roundText");
const turnText = document.getElementById("turnText");

const board = document.getElementById("board");

const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageSub = document.getElementById("messageSub");

let cells = [];

let currentPlayer = "O";
let startingPlayer = "O";

let oWins = 0;
let xWins = 0;

let round = 1;
let gameOver = false;


/* =========================
   OFFLINE SOUND SYSTEM
========================= */

let audioCtx = null;

function getAudioContext() {
    try {
        if (!audioCtx) {
            audioCtx = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        return audioCtx;

    } catch (error) {
        return null;
    }
}


function makeTone(frequency, duration, volume) {

    const ctx = getAudioContext();

    if (!ctx) return;

    try {

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(
            volume,
            ctx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + duration
        );

        oscillator.connect(gain);

        gain.connect(ctx.destination);

        oscillator.start();

        oscillator.stop(
            ctx.currentTime + duration
        );

    } catch (error) {
        // Sound error se game nahi rukega
    }
}


/* =========================
   PLAY BUTTON SOUND
========================= */

function playButtonSound() {

    makeTone(600, 0.08, 0.10);

    setTimeout(function () {
        makeTone(800, 0.12, 0.10);
    }, 80);
}


/* =========================
   TAP SOUND
========================= */

function playTapSound() {

    makeTone(700, 0.08, 0.08);
}


/* =========================
   WIN SOUND
========================= */

function playWinSound() {

    makeTone(523, 0.15, 0.12);

    setTimeout(function () {
        makeTone(659, 0.15, 0.12);
    }, 150);

    setTimeout(function () {
        makeTone(784, 0.30, 0.12);
    }, 300);
}


/* =========================
   DRAW SOUND
========================= */

function playDrawSound() {

    makeTone(440, 0.18, 0.10);

    setTimeout(function () {
        makeTone(330, 0.25, 0.10);
    }, 180);
}


/* =========================
   RESET SOUND
========================= */

function playResetSound() {

    makeTone(500, 0.08, 0.08);

    setTimeout(function () {
        makeTone(350, 0.12, 0.08);
    }, 80);
}


/* =========================
   WIN PATTERNS
========================= */

const winPatterns = [

    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]

];


/* =========================
   PLAY BUTTON
========================= */

playBtn.addEventListener("click", function () {

    playButtonSound();

    homeScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    startRound();

});


/* =========================
   START ROUND
========================= */

function startRound() {

    gameOver = false;

    currentPlayer = startingPlayer;

    cells = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "", 
        "", 
    ];

    roundText.textContent =
        "Round " + round;

    turnText.textContent =
        currentPlayer + "'s Turn";

    board.innerHTML = "";


    for (let i = 0; i < 9; i++) {

        const cell =
            document.createElement("button");

        cell.type = "button";

        cell.className = "cell";
        cell.style.pointerEvents = "auto";
cell.style.touchAction = "manipulation";


        cell.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                playMove(i);

            }
        );


        board.appendChild(cell);
    }
}


/* =========================
   PLAY MOVE
========================= */

function playMove(index) {

    if (gameOver) return;

    if (cells[index] !== "") return;


    cells[index] = currentPlayer;


    playTapSound();


    const cell =
        board.children[index];


    cell.textContent =
        currentPlayer;


    if (currentPlayer === "O") {

        cell.classList.add("o");

    } else {

        cell.classList.add("x");

    }


    const winningLine =
        checkWinner();


    if (winningLine) {

        finishWin(winningLine);

        return;
    }


    if (
        cells.every(function (value) {
            return value !== "";
        })
    ) {

        finishDraw();

        return;
    }


    currentPlayer =
        currentPlayer === "O"
            ? "X"
            : "O";


    turnText.textContent =
        currentPlayer + "'s Turn";
}


/* =========================
   CHECK WINNER
========================= */

function checkWinner() {

    for (
        const pattern of winPatterns
    ) {

        const a = pattern[0];
        const b = pattern[1];
        const c = pattern[2];


        if (
            cells[a] !== "" &&
            cells[a] === cells[b] &&
            cells[a] === cells[c]
        ) {

            return pattern;
        }
    }


    return null;
}


/* =========================
   WIN
========================= */

function finishWin(winningLine) {

    gameOver = true;


    playWinSound();


    winningLine.forEach(
        function (index) {

            board.children[index]
                .classList.add("win");

        }
    );


    if (currentPlayer === "O") {

        oWins++;

    } else {

        xWins++;

    }


    updateScore();


    /* Winner starts next round */

    startingPlayer =
        currentPlayer;


    showMessage(
        currentPlayer + " Wins!",
        "Round " + round + " complete"
    );


    setTimeout(
        function () {

            hideMessage();

            round++;

            startRound();

        },
        1300
    );
}


/* =========================
   DRAW
========================= */

function finishDraw() {

    gameOver = true;


    playDrawSound();


    /*
       Higher score wala
       next round start karega.
    */

    if (oWins > xWins) {

        startingPlayer = "O";

    }

    else if (xWins > oWins) {

        startingPlayer = "X";

    }

    /*
       Agar score equal hai,
       previous starter continue karega.
    */


    showMessage(
        "Draw!",
        "Round " + round + " complete"
    );


    setTimeout(
        function () {

            hideMessage();

            round++;

            startRound();

        },
        1300
    );
}


/* =========================
   UPDATE SCORE
========================= */

function updateScore() {

    oScore.textContent =
        oWins +
        (oWins === 1
            ? " Win"
            : " Wins");


    xScore.textContent =
        xWins +
        (xWins === 1
            ? " Win"
            : " Wins");
}


/* =========================
   MESSAGE
========================= */

function showMessage(
    title,
    sub
) {

    messageTitle.textContent =
        title;

    messageSub.textContent =
        sub;

    message.classList.remove(
        "hidden"
    );
}


function hideMessage() {

    message.classList.add(
        "hidden"
    );
}


/* =========================
   RESET SCORE
========================= */

resetBtn.addEventListener(
    "click",
    function () {

        playResetSound();

        oWins = 0;

        xWins = 0;

        round = 1;

        startingPlayer = "O";

        currentPlayer = "O";

        updateScore();

        startRound();

    }
);


/* =========================
   INITIAL SCORE
========================= */

updateScore();
