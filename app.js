// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;
const boxSize = 20;

// Load images
const snakeHeadImg = new Image();
snakeHeadImg.src = "images/snake-head.jpg";

const snakeBodyImg = new Image();
snakeBodyImg.src = "images/snake-body.jpg";

const foodImg = new Image();
foodImg.src = "images/food.jpg";

const backgroundImg = new Image();
backgroundImg.src = "images/background.jpg";

// Snake and food setup
let snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
let food = {
  x: Math.floor(Math.random() * canvas.width / boxSize) * boxSize,
  y: Math.floor(Math.random() * canvas.height / boxSize) * boxSize
};
let direction = "";
let score = 0;

// Particle array for visual effects
const particles = [];

// Function to create particles at a specific location
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

// Function to draw particles and animate them
function drawParticles() {
  particles.forEach((particle, index) => {
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.alpha -= 0.02;
    
    // Remove particles that have faded out
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    }
  });
  ctx.globalAlpha = 1;
}

// Function to draw the background
function drawBackground() {
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

// Function to draw the snake
function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.drawImage(snakeHeadImg, segment.x, segment.y, boxSize, boxSize);
    } else {
      ctx.drawImage(snakeBodyImg, segment.x, segment.y, boxSize, boxSize);
    }
  });
}

// Function to draw the food
function drawFood() {
  ctx.drawImage(foodImg, food.x, food.y, boxSize, boxSize);
}

// Function to move the snake
function moveSnake() {
  const head = { ...snake[0] };

  if (direction === "LEFT") head.x -= boxSize;
  if (direction === "UP") head.y -= boxSize;
  if (direction === "RIGHT") head.x += boxSize;
  if (direction === "DOWN") head.y += boxSize;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    createParticles(food.x + boxSize / 2, food.y + boxSize / 2); // Add particles at food location
    food = {
      x: Math.floor(Math.random() * canvas.width / boxSize) * boxSize,
      y: Math.floor(Math.random() * canvas.height / boxSize) * boxSize
    };
  } else {
    snake.pop();
  }
}

// Function to detect collisions
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

// Main game update function
function updateGame() {
  if (detectCollision()) {
    alert(`Game Over! Your score: ${score}`);
    snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
    direction = "";
    score = 0;
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();    // Draw background
    drawSnake();         // Draw snake
    drawFood();          // Draw food
    drawParticles();     // Draw particle effects
    moveSnake();         // Move snake
  }
}

// Keydown event listener for controlling the snake
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Set the game loop
setInterval(updateGame, 100);

// Register the service worker for offline support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("Service Worker registered successfully."))
    .catch((error) => console.error("Service Worker registration failed:", error));
}
