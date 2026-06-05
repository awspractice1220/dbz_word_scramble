// ------------------------------
// Sneaker Cursor Rotation
// ------------------------------
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

setInterval(rotateCursor, 120000); // every 2 minutes


// ------------------------------
// Fetch New Word
// ------------------------------
async function getNewWord() {
    const res = await fetch("/api/new-word");
    const data = await res.json();

    document.getElementById("scrambledWord").textContent = data.scrambled;
    document.getElementById("difficultyValue").textContent = data.difficulty;
}

document.getElementById("newWordBtn").onclick = getNewWord;


// ------------------------------
// Submit Answer
// ------------------------------
document.getElementById("submitBtn").onclick = async () => {
    const answer = document.getElementById("answerInput").value;

    const res = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer })
    });

    const data = await res.json();

    document.getElementById("scoreValue").textContent = data.score;
    document.getElementById("difficultyValue").textContent = data.difficulty;

    if (data.correct) {
        getNewWord();
    }
};


// ------------------------------
// Luxury Clock Rendering
// ------------------------------
const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");

function drawClock() {
    const now = new Date();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer glow
    ctx.beginPath();
    ctx.arc(100, 100, 95, 0, Math.PI * 2);
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 6;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "gold";
    ctx.stroke();

    // Hands
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours() % 12;

    drawHand(hr * 30 + min / 2, 50, 6, "white");
    drawHand(min * 6, 70, 4, "cyan");
    drawHand(sec * 6, 80, 2, "red");

    requestAnimationFrame(drawClock);
}

function drawHand(angle, length, width, color) {
    ctx.save();
    ctx.translate(100, 100);
    ctx.rotate((Math.PI / 180) * angle);
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
