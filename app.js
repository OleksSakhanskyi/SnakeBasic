// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;
const boxSize = 20;

// Load images
const snakeHeadImg = new Image();
snakeHeadImg.src = "images/snake-head.png";

const snakeBodyImg = new Image();
snakeBodyImg.src = "images/snake-body.png";

const foodImg = new Image();
foodImg.src = "images/food.png";

const backgroundImg = new Image();
backgroundImg.src = "images/background.jpg";

// Snake and food setup
let snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
let apples = [];
let direction = "RIGHT";
let pendingDirection = direction; // To track the next valid direction
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

// Function to rotate snake head based on direction
function rotateSnakeHead(x, y, direction) {
  ctx.save();

  ctx.translate(x + boxSize / 2, y + boxSize / 2);

  if (direction === "UP") {
    ctx.rotate(-Math.PI / 2);
  } else if (direction === "DOWN") {
    ctx.rotate(Math.PI / 2);
  } else if (direction === "LEFT") {
    ctx.rotate(Math.PI);
  }

  ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);

  ctx.restore();
}

// Function to draw the snake
function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      rotateSnakeHead(segment.x, segment.y, direction);
    } else {
      ctx.drawImage(snakeBodyImg, segment.x, segment.y, boxSize, boxSize);
    }
  });
}

// Function to spawn a single apple at a valid position
function spawnApple() {
  let newApple;
  let isValidPosition = false;

  while (!isValidPosition) {
    newApple = {
      x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
      y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
    };

    isValidPosition = !snake.some(segment => segment.x === newApple.x && segment.y === newApple.y);
  }

  return newApple;
}

// Function to spawn multiple apples
function spawnApples(count) {
  apples = [];
  for (let i = 0; i < count; i++) {
    apples.push(spawnApple());
  }
}

// Function to draw apples
function drawApples() {
  apples.forEach(apple => {
    ctx.drawImage(foodImg, apple.x, apple.y, boxSize, boxSize);
  });
}

// Function to move the snake
function moveSnake() {
  direction = pendingDirection;

  const head = { ...snake[0] };

  if (direction === "LEFT") head.x -= boxSize;
  if (direction === "UP") head.y -= boxSize;
  if (direction === "RIGHT") head.x += boxSize;
  if (direction === "DOWN") head.y += boxSize;

  snake.unshift(head);

  const eatenAppleIndex = apples.findIndex(apple => apple.x === head.x && apple.y === head.y);

  if (eatenAppleIndex !== -1) {
    score++;
    createParticles(apples[eatenAppleIndex].x + boxSize / 2, apples[eatenAppleIndex].y + boxSize / 2);
    apples.splice(eatenAppleIndex, 1);

    if (apples.length === 0) {
      spawnApples(4);
    }
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
    direction = "RIGHT";
    pendingDirection = direction;
    score = 0;
    spawnApples(4);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawSnake();
    drawApples();
    drawParticles();
    moveSnake();
  }
}

// Keydown event listener for controlling the snake
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") pendingDirection = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") pendingDirection = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") pendingDirection = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") pendingDirection = "DOWN";
});

// Touch control for mobile
let touchStartX = 0, touchStartY = 0;
document.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
});

document.addEventListener("touchmove", (event) => {
  const deltaX = event.touches[0].clientX - touchStartX;
  const deltaY = event.touches[0].clientY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0 && direction !== "LEFT") pendingDirection = "RIGHT";
    if (deltaX < 0 && direction !== "RIGHT") pendingDirection = "LEFT";
  } else {
    if (deltaY > 0 && direction !== "UP") pendingDirection = "DOWN";
    if (deltaY < 0 && direction !== "DOWN") pendingDirection = "UP";
  }
});

// Spawn initial apples and set the game loop
spawnApples(4);
setInterval(updateGame, 150);
