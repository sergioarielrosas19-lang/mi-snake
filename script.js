const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let scoreText = document.getElementById("score");
if (!scoreText) {
  scoreText = document.createElement("h2");
  scoreText.id = "score";
  scoreText.textContent = "Puntaje: 0";
  document.querySelector(".game-container").insertBefore(scoreText, canvas);
}

const box = 20;

let snake = [];
let direction = "RIGHT";
let food = null;
let score = 0;
let game = null;

function playEatSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08);
  } catch (err) {
    // Si el navegador bloquea audio, no pasa nada.
  }
}

function randomFoodPosition() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
  } while (snake.some(s => s.x === position.x && s.y === position.y));

  return position;
}

function collision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // fondo suave
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // comida
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // serpiente
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00ff88" : "#00cc66";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);

    ctx.strokeStyle = "#003322";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }
}

function endGame() {
  clearInterval(game);
  game = null;
  scoreText.textContent = "💀 Game Over | Puntaje: " + score;

  let btn = document.getElementById("restart");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "restart";
    btn.innerText = "Reiniciar";
    btn.style.marginTop = "15px";
    btn.style.padding = "12px 22px";
    btn.style.fontSize = "18px";
    btn.style.border = "none";
    btn.style.borderRadius = "12px";
    btn.style.background = "#444";
    btn.style.color = "white";

    btn.onclick = () => {
      btn.remove();
      startGame();
    };

    document.querySelector(".game-container").appendChild(btn);
  }
}

function update() {
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;
  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;

  const newHead = { x: headX, y: headY };

  // paredes
  if (
    headX < 0 ||
    headY < 0 ||
    headX >= canvas.width ||
    headY >= canvas.height
  ) {
    endGame();
    return;
  }

  const ateFood = headX === food.x && headY === food.y;

  // mueve el cuerpo
  snake.unshift(newHead);

  if (ateFood) {
    score++;
    scoreText.textContent = "Puntaje: " + score;
    food = randomFoodPosition();
    playEatSound();
  } else {
    snake.pop();
  }

  // chocar con el propio cuerpo
  if (collision(newHead, snake.slice(1))) {
    endGame();
    return;
  }

  draw();
}

function startGame() {
  const restartBtn = document.getElementById("restart");
  if (restartBtn) restartBtn.remove();

  snake = [{ x: 200, y: 200 }];
  direction = "RIGHT";
  score = 0;
  food = randomFoodPosition();

  scoreText.textContent = "Puntaje: 0";

  if (game) clearInterval(game);
  draw();
  game = setInterval(update, 150);
}

// teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// botones
const upBtn = document.getElementById("up");
const downBtn = document.getElementById("down");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

if (upBtn) upBtn.onclick = () => { if (direction !== "DOWN") direction = "UP"; };
if (downBtn) downBtn.onclick = () => { if (direction !== "UP") direction = "DOWN"; };
if (leftBtn) leftBtn.onclick = () => { if (direction !== "RIGHT") direction = "LEFT"; };
if (rightBtn) rightBtn.onclick = () => { if (direction !== "LEFT") direction = "RIGHT"; };

startGame();