const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let boxSize = 20; // Base unit size for the grid

// Resize canvas dynamically based on the device's screen size
function resizeCanvas() {
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = Math.floor((minDimension * 0.8) / boxSize) * boxSize; // 80% of the smaller dimension, snap to grid
  canvas.height = canvas.width;
  boxSize = canvas.width / 20; // Adjust boxSize based on canvas width
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Load images
const snakeHeadImg = new Image();
snakeHeadImg.src = "images/snake-head.png";

const snakeBodyImg = new Image();
snakeBodyImg.src = "images/snake-body.png";

const foodImg = new Image();
foodImg.src = "images/food.png";

const backgroundImg = new Image();
backgroundImg.src = "images/background.jpg";

// Game variables
let snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
let food = {
  x: Math.floor(Math.random() * canvas.width / boxSize) * boxSize,
  y: Math.floor(Math.random() * canvas.height / boxSize) * boxSize
};
let direction = "RIGHT";
let score = 0;
const particles = [];

// Function to create particles
function createParticles(x, y) {
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: x,
      y: y,
      size: Math.random() * 5 + 2,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 2 - 1,
      alpha: 1
    });
  }
}

// Function to update and draw particles
function updateParticles() {
  particles.forEach((particle, index) => {
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.alpha -= 0.02;

    if (particle.alpha <= 0) {
      particles.splice(index, 1); // Remove faded particles
    }
  });
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// Draw the background
function drawBackground() {
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

// Rotate and draw the snake head
function rotateSnakeHead(x, y, direction) {
  ctx.save();
  ctx.translate(x + boxSize / 2, y + boxSize / 2);
  if (direction === "UP") ctx.rotate(-Math.PI / 2);
  else if (direction === "DOWN") ctx.rotate(Math.PI / 2);
  else if (direction === "LEFT") ctx.rotate(Math.PI);
  ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);
  ctx.restore();
}

// Draw the snake
function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      rotateSnakeHead(segment.x, segment.y, direction);
    } else {
      ctx.drawImage(snakeBodyImg, segment.x, segment.y, boxSize, boxSize);
    }
  });
}

// Draw the food
function drawFood() {
  ctx.drawImage(foodImg, food.x, food.y, boxSize, boxSize);
}

// Move the snake
function moveSnake() {
  const head = { ...snake[0] };

  if (direction === "LEFT") head.x -= boxSize;
  if (direction === "UP") head.y -= boxSize;
  if (direction === "RIGHT") head.x += boxSize;
  if (direction === "DOWN") head.y += boxSize;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    createParticles(food.x + boxSize / 2, food.y + boxSize / 2);
    food = {
      x: Math.floor(Math.random() * canvas.width / boxSize) * boxSize,
      y: Math.floor(Math.random() * canvas.height / boxSize) * boxSize
    };
  } else {
    snake.pop();
  }
}

// Detect collisions
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

// Keyboard controls for PC
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

// Main game loop using requestAnimationFrame
let lastTime = 0;
const gameSpeed = 150; // Game speed in milliseconds

function gameLoop(timestamp) {
  if (timestamp - lastTime > gameSpeed) {
    lastTime = timestamp;

    if (detectCollision()) {
      alert(`Game Over! Your score: ${score}`);
      snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
      direction = "RIGHT";
      score = 0;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawSnake();
      drawFood();
      drawParticles();
      moveSnake();
      updateParticles();
    }
  }
  requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);
