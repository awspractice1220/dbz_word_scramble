const sneakers = [
    "/static/cursors/jordan1.png",
    "/static/cursors/jordan4.png",
    "/static/cursors/jordan11.png"
];

let cursorIndex = 0;

function rotateCursor() {
    cursorIndex = (cursorIndex + 1) % sneakers.length;
    document.body.style.cursor = `url('${sneakers[cursorIndex]}'), auto`;
}

setInterval(rotateCursor, 120000);

const answerInput = document.getElementById("answerInput");
const scrambledWordEl = document.getElementById("scrambledWord");
const hintValueEl = document.getElementById("hintValue");
const scoreValueEl = document.getElementById("scoreValue");
const difficultyValueEl = document.getElementById("difficultyValue");
const streakValueEl = document.getElementById("streakValue");
const statusBadgeEl = document.getElementById("statusBadge");

async function getNewWord() {
    const res = await fetch("/api/new-word");
    const data = await res.json();

    scrambledWordEl.textContent = data.scrambled.toUpperCase();
    hintValueEl.textContent = data.hint;
    difficultyValueEl.textContent = data.difficulty;
    statusBadgeEl.textContent = "New challenge loaded";
    answerInput.value = "";
    answerInput.focus();
}

async function submitAnswer() {
    const answer = answerInput.value.trim();
    if (!answer) {
        statusBadgeEl.textContent = "Type a name to begin";
        return;
    }

    const res = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer })
    });

    const data = await res.json();
    scoreValueEl.textContent = data.score;
    difficultyValueEl.textContent = data.difficulty;
    streakValueEl.textContent = data.streak;
    statusBadgeEl.textContent = data.message;

    if (data.correct) {
        setTimeout(getNewWord, 600);
    }
}

async function resetGame() {
    await fetch("/api/reset");
    scoreValueEl.textContent = "0";
    difficultyValueEl.textContent = "1";
    streakValueEl.textContent = "0";
    statusBadgeEl.textContent = "Arena reset";
    await getNewWord();
}

if (document.getElementById("newWordBtn")) {
    document.getElementById("newWordBtn").onclick = getNewWord;
}

if (document.getElementById("submitBtn")) {
    document.getElementById("submitBtn").onclick = submitAnswer;
}

if (document.getElementById("resetBtn")) {
    document.getElementById("resetBtn").onclick = resetGame;
}

answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        submitAnswer();
    }
});

const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");

function drawClock() {
    const now = new Date();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.beginPath();
    ctx.arc(0, 0, 92, 0, Math.PI * 2);
    ctx.strokeStyle = "#f6d76b";
    ctx.lineWidth = 8;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#f6d76b";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 78, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < 12; i += 1) {
        const angle = (Math.PI / 6) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 72, Math.sin(angle) * 72);
        ctx.lineTo(Math.cos(angle) * 84, Math.sin(angle) * 84);
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours() % 12;

    drawHand(hr * 30 + min / 2, 56, 6, "#ffffff");
    drawHand(min * 6, 74, 4, "#31d3ff");
    drawHand(sec * 6, 86, 2, "#ff6b6b");
    ctx.restore();

    requestAnimationFrame(drawClock);
}

function drawHand(angle, length, width, color) {
    const radians = (Math.PI / 180) * angle;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
}

drawClock();
getNewWord();
