const board = document.getElementById('game-board');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

const pandaBear = document.getElementById('panda-bear');
const grizzBear = document.getElementById('grizz-bear');
const popEmote = document.getElementById('pop-emote');
const popEmoteImg = document.getElementById('pop-emote-img');
const confettiContainer = document.getElementById('confetti-container');
const polarVictory = document.getElementById('polar-victory');

const pandaHead = "https://i.postimg.cc/zf14YmZk/pola.png";
const grizzHead = "https://i.postimg.cc/2y8Dpsv8/grizz-head-removebg-preview.png";
const polarVictoryLeft = "https://i.postimg.cc/wTdk45VG/left.png";
const polarVictoryRight = "https://i.postimg.cc/qqc2HYwf/right.png";

let cells;
let currentPlayer;
let gameActive;
let state; // Array of 9, each X/O/"".

const WIN_COMBINATIONS = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diags
];

function updateBearVisibility(winner = null) {
    if (!gameActive) {
        pandaBear.classList.remove("show");
        grizzBear.classList.remove("show");
        pandaBear.classList.remove("winner-dance");
        grizzBear.classList.remove("winner-dance");
        return;
    }
    pandaBear.classList.remove("winner-dance");
    grizzBear.classList.remove("winner-dance");
    if (currentPlayer === 'X') {
        grizzBear.classList.add("show");
        pandaBear.classList.remove("show");
    } else {
        pandaBear.classList.add("show");
        grizzBear.classList.remove("show");
    }
}

function winnerBearDance(who) {
    if (who === "X") {
        grizzBear.classList.add("winner-dance");
    } else if (who === "O") {
        pandaBear.classList.add("winner-dance");
    }
}

function popEmoteShow(who) {
    popEmoteImg.src = (who === "X") ? grizzHead : pandaHead;
    popEmoteImg.alt = (who === "X") ? "Grizz Head" : "Panda Head";
    popEmote.classList.remove("active");
    void popEmote.offsetWidth; // force reflow
    popEmote.classList.add("active");
    setTimeout(() => {
        popEmote.classList.remove("active");
    }, 900);
}

function showConfetti() {
    confettiContainer.innerHTML = "";
    const colors = ["#ff5959", "#fcb69f", "#fff4c4", "#7d507b", "#a25517", "#baffce", "#f8e1ff"];
    const count = 32 + Math.floor(Math.random()*12);
    for (let i=0; i<count; i++) {
        const conf = document.createElement("div");
        conf.className = "confetti-piece";
        conf.style.background = colors[Math.floor(Math.random()*colors.length)];
        conf.style.left = (10 + Math.random()*80) + "vw";
        conf.style.top = (-8 + Math.random()*10) + "vh";
        conf.style.animationDuration = (1.15 + Math.random()*0.8) + "s";
        conf.style.opacity = 0.7 + Math.random()*0.3;
        conf.style.transform = `rotate(${Math.random()*360}deg)`;
        confettiContainer.appendChild(conf);
        setTimeout(()=>conf.remove(), 1800);
    }
}

function showPolarVictory(winner) {
    // Reset both classes first for safety!
    polarVictory.classList.remove("right", "show");
    polarVictory.style.display = "none";
    polarVictory.src = "";
    if (winner === "X") {
        polarVictory.src = polarVictoryLeft;
        polarVictory.alt = "Polar Teasing Panda";
        polarVictory.style.display = "block";
        // Left side (default, no .right class)
        setTimeout(() => polarVictory.classList.add("show"), 10); // allow reflow for transition
    } else if (winner === "O") {
        polarVictory.src = polarVictoryRight;
        polarVictory.alt = "Polar Teasing Grizz";
        polarVictory.classList.add("right");
        polarVictory.style.display = "block";
        setTimeout(() => polarVictory.classList.add("show"), 10);
    }
}

function hidePolarVictory() {
    polarVictory.style.display = "none";
    polarVictory.classList.remove("show", "right");
    polarVictory.src = "";
}

function startGame() {
    board.innerHTML = '';
    state = Array(9).fill('');
    currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
    gameActive = true;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', onCellClick);
        board.appendChild(cell);
    }
    cells = Array.from(document.getElementsByClassName('cell'));
    const playerName = currentPlayer === "X" ? "Grizz" : "Panda";
setStatus(`Turn: <span style="color:#ff5959">${playerName}</span>`);
    updateBearVisibility();
    confettiContainer.innerHTML = "";
    hidePolarVictory();
}

function setStatus(msg) {
    statusText.innerHTML = msg;
}

function onCellClick(e) {
    const idx = e.target.dataset.index;
    if (!gameActive || state[idx] !== '') return;

    state[idx] = currentPlayer;
    // Show bear head image
    const img = document.createElement('img');
    img.src = currentPlayer === "X" ? grizzHead : pandaHead;
    img.alt = currentPlayer === "X" ? "Grizz Head" : "Panda Head";
    img.style.width = "62px";
    img.style.height = "62px";
    img.style.userSelect = "none";
    img.style.pointerEvents = "none";
    e.target.appendChild(img);
    e.target.classList.add('disabled');

    popEmoteShow(currentPlayer);

    const winner = checkWinner();
    if (winner) {
        endGame(false, winner);
    } else if (state.every(cell => cell)) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        const playerName = currentPlayer === "X" ? "Grizz" : "Panda";
setStatus(`Turn: <span style="color:#ff5959">${playerName}</span>`);
        updateBearVisibility();
    }
}

function checkWinner() {
    for (const combo of WIN_COMBINATIONS) {
        const [a, b, c] = combo;
        if (
            state[a] &&
            state[a] === state[b] &&
            state[a] === state[c]
        ) {
            combo.forEach(i => cells[i].style.background = '#ff5959');
            return state[a];
        }
    }
    return null;
}

function endGame(draw, winner = null) {
    gameActive = false;
    cells.forEach(cell => cell.classList.add('disabled'));
    updateBearVisibility(winner);

    if (draw) {
        setStatus(`<span style="color:#fcb69f;font-weight:700">It's a draw!</span>`);
        hidePolarVictory();
    } else {
        const winnerName = winner === "X" ? "Grizz" : "Panda";
setStatus(
    `🎉 Winner: <span style="color:#ff5959">${winnerName}</span>!`
);
        winnerBearDance(winner);
        showConfetti();
        showPolarVictory(winner);
    }
}

resetBtn.addEventListener('click', startGame);

window.onload = startGame;