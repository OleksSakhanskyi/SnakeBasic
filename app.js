// Register the service worker for offline support
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("Service Worker registered successfully."))
      .catch((error) => console.error("Service Worker registration failed:", error));
  }
  

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;
const boxSize = 20;

let snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
let food = { 
  x: Math.floor(Math.random() * canvas.width / boxSize) * boxSize,
  y: Math.floor(Math.random() * canvas.height / boxSize) * boxSize
};
let direction = "";
let score = 0;

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "darkgreen" : "green";
    ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
  });
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

function moveSnake() {
  const head = { ...snake[0] };

  if (direction === "LEFT") head.x -= boxSize;
  if (direction === "UP") head.y -= boxSize;
  if (direction === "RIGHT") head.x += boxSize;
  if (direction === "DOWN") head.y += boxSize;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = { 
      x: Math.floor(Math.random() * canvas.width / boxSize) * boxSize,
      y: Math.floor(Math.random() * canvas.height / boxSize) * boxSize
    };
  } else {
    snake.pop();
  }
}

function detectCollision() {
  const head = snake[0];

  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

function updateGame() {
  if (detectCollision()) {
    alert(`Game Over! Your score: ${score}`);
    snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
    direction = "";
    score = 0;
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    moveSnake();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

setInterval(updateGame, 100);
