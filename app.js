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
  ctx.save(); // Save current state of canvas

  // Move the canvas to the snake's head position
  ctx.translate(x + boxSize / 2, y + boxSize / 2);

  // Rotate the canvas based on the direction
  if (direction === "UP" ) {
    ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counterclockwise
  } else if (direction === "DOWN") {
    ctx.rotate(Math.PI / 2); // Rotate 90 degrees clockwise
  } else if (direction === "LEFT") {
    ctx.rotate(Math.PI); // Rotate 180 degrees
  }

  // Draw the snake head image at the rotated position
  ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);

  ctx.restore(); // Restore the canvas state
}

// Function to draw the snake
function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Draw the snake head with rotation
      rotateSnakeHead(segment.x, segment.y, direction);
    } else {
      // Draw the snake body without rotation
      ctx.drawImage(snakeBodyImg, segment.x, segment.y, boxSize, boxSize);
    }
  });
}

// Function to spawn a single apple at a valid position
function spawnApple() {
  let newApple;
  let isValidPosition = false;

  // Keep generating positions until a valid one is found
  while (!isValidPosition) {
    newApple = {
      x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
      y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
    };

    // Check if the new apple's position overlaps with the snake
    isValidPosition = !snake.some(segment => segment.x === newApple.x && segment.y === newApple.y);
  }

  return newApple;
}

// Function to spawn multiple apples
function spawnApples(count) {
  apples = []; // Reset apples array
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
  const head = { ...snake[0] };

  if (direction === "LEFT") head.x -= boxSize;
  if (direction === "UP") head.y -= boxSize;
  if (direction === "RIGHT") head.x += boxSize;
  if (direction === "DOWN") head.y += boxSize;

  snake.unshift(head);

  // Check if the snake eats any apple
  const eatenAppleIndex = apples.findIndex(apple => apple.x === head.x && apple.y === head.y);

  if (eatenAppleIndex !== -1) {
    score++;
    createParticles(apples[eatenAppleIndex].x + boxSize / 2, apples[eatenAppleIndex].y + boxSize / 2); // Add particles
    apples.splice(eatenAppleIndex, 1); // Remove eaten apple

    // If no apples remain, spawn four new apples
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
    score = 0;
    spawnApples(4); // Spawn new apples on restart
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawSnake();
    drawApples(); // Draw multiple apples
    drawParticles();
    moveSnake();
  }
}

// Keydown event listener for controlling the snake
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
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
    if (deltaX > 0 && direction !== "LEFT") direction = "RIGHT";
    if (deltaX < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (deltaY > 0 && direction !== "UP") direction = "DOWN";
    if (deltaY < 0 && direction !== "DOWN") direction = "UP";
  }
});

// Spawn initial apples and set the game loop
spawnApples(4);
setInterval(updateGame, 150);
