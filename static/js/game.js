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

setInterval(rotateCursor, 15000);
rotateCursor();

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

    const outerRadius = 118;
    const innerRadius = 92;

    const bezelGradient = ctx.createRadialGradient(0, 0, 24, 0, 0, outerRadius);
    bezelGradient.addColorStop(0, '#fff9ed');
    bezelGradient.addColorStop(0.35, '#ffd46f');
    bezelGradient.addColorStop(0.7, '#d4a261');
    bezelGradient.addColorStop(1, '#c48d4a');

    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = bezelGradient;
    ctx.fill();

    for (let i = 0; i < 24; i += 1) {
        const angle = (Math.PI * 2 / 24) * i;
        const radius = outerRadius - 10;
        const size = i % 2 === 0 ? 6 : 4;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, size, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#fcefbe';
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf7';
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.stroke();

    for (let i = 0; i < 12; i += 1) {
        const angle = (Math.PI / 6) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 70, Math.sin(angle) * 70);
        ctx.lineTo(Math.cos(angle) * 88, Math.sin(angle) * 88);
        ctx.strokeStyle = '#a57f26';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    drawSubdial(-45, -20);
    drawSubdial(45, -20);

    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours() % 12;

    drawHand(hr * 30 + min / 2, 52, 7, '#4b3514');
    drawHand(min * 6, 78, 5, '#1f78d8');
    drawHand(sec * 6, 86, 2, '#e14f4f');

    ctx.beginPath();
    ctx.fillStyle = '#2f2414';
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    requestAnimationFrame(drawClock);
}

function drawSubdial(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d2b873';
    ctx.stroke();
    ctx.restore();
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
