const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fullscreen canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Input state
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
};

// Rocket object
const rocket = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  angle: 0,
  radius: 10,
};

// Fuel system
const MAX_FUEL = 100;
let fuel = MAX_FUEL;
const FUEL_CONSUMPTION = 0.2;

// Planets array
let planets = [];

// Constants
const THRUST = 0.1;
const ROTATION_SPEED = 0.05;
const FRICTION = 0.999;
const G = 0.5;

// Game state
let gameRunning = false;
let gameOver = false;
let startTime = 0;

// Initialize rocket position (bottom-left offset)
function setRocketStart() {
  rocket.x = canvas.width * (1 / 8);
  rocket.y = canvas.height * (7 / 8);
  rocket.vx = 0;
  rocket.vy = 0;
  rocket.angle = 0;
}

// Generate random planets
function generatePlanets() {
  planets = [];

  const count = 2 + Math.floor(Math.random() * 2); // 2–3 planets

  for (let i = 0; i < count; i++) {
    planets.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      mass: 1000 + Math.random() * 1500,
      radius: 25 + Math.random() * 25,
    });
  }
}

// Input listeners
window.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;

  if (e.code === "Space" && gameOver) {
    resetGame();
  }

  if (e.code === "Escape") {
    returnToMenu();
  }
});

window.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Start game
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  canvas.style.display = "block";

  generatePlanets();
  setRocketStart();
  fuel = MAX_FUEL;

  gameRunning = true;
  gameOver = false;
  startTime = Date.now();

  gameLoop();
});

// Return to menu
function returnToMenu() {
  gameRunning = false;
  gameOver = false;
  canvas.style.display = "none";
  menu.style.display = "block";
}

// Reset game
function resetGame() {
  generatePlanets();
  setRocketStart();
  fuel = MAX_FUEL;

  gameOver = false;
  startTime = Date.now();
}

// Main loop
function gameLoop() {
  update();
  draw();
  if (gameRunning) requestAnimationFrame(gameLoop);
}

// Physics update
function update() {
  if (gameOver) return;

  // Rotation
  if (keys.ArrowLeft) rocket.angle -= ROTATION_SPEED;
  if (keys.ArrowRight) rocket.angle += ROTATION_SPEED;

  // Thrust (only if fuel remains)
  if (keys.ArrowUp && fuel > 0) {
    rocket.vx += Math.cos(rocket.angle) * THRUST;
    rocket.vy += Math.sin(rocket.angle) * THRUST;
    fuel -= FUEL_CONSUMPTION;
    if (fuel < 0) fuel = 0;
  }

  // Gravity
  planets.forEach((planet) => {
    const dx = planet.x - rocket.x;
    const dy = planet.y - rocket.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Collision
    if (distance < planet.radius + rocket.radius) {
      gameOver = true;
    }

    const force = (G * planet.mass) / (distance * distance);
    const angle = Math.atan2(dy, dx);

    rocket.vx += Math.cos(angle) * force;
    rocket.vy += Math.sin(angle) * force;
  });

  // Apply velocity
  rocket.x += rocket.vx;
  rocket.y += rocket.vy;

  // Friction
  rocket.vx *= FRICTION;
  rocket.vy *= FRICTION;

  // Screen wrap
  if (rocket.x < 0) rocket.x = canvas.width;
  if (rocket.x > canvas.width) rocket.x = 0;
  if (rocket.y < 0) rocket.y = canvas.height;
  if (rocket.y > canvas.height) rocket.y = 0;
}

// 🔮 Improved trajectory prediction
function drawTrajectory() {
  let simX = rocket.x;
  let simY = rocket.y;
  let simVX = rocket.vx;
  let simVY = rocket.vy;

  const TIME_STEP = 0.5;

  ctx.beginPath();

  for (let i = 0; i < 300; i++) {
    for (let planet of planets) {
      const dx = planet.x - simX;
      const dy = planet.y - simY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Stop if collision would occur
      if (distance < planet.radius + rocket.radius) {
        ctx.lineTo(simX, simY);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
        return;
      }

      const force = (G * planet.mass) / (distance * distance);
      const angle = Math.atan2(dy, dx);

      simVX += Math.cos(angle) * force * TIME_STEP;
      simVY += Math.sin(angle) * force * TIME_STEP;
    }

    // Apply friction (critical for accuracy)
    simVX *= FRICTION;
    simVY *= FRICTION;

    simX += simVX * TIME_STEP;
    simY += simVY * TIME_STEP;

    if (i === 0) ctx.moveTo(simX, simY);
    else ctx.lineTo(simX, simY);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.stroke();
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Planets
  planets.forEach((planet) => {
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "blue";
    ctx.stroke();
  });

  // Trajectory
  drawTrajectory();

  // Rocket
  ctx.save();
  ctx.translate(rocket.x, rocket.y);
  ctx.rotate(rocket.angle);

  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-15, 10);
  ctx.closePath();

  ctx.strokeStyle = "white";
  ctx.stroke();

  if (keys.ArrowUp && fuel > 0) {
    ctx.beginPath();
    ctx.moveTo(-15, -5);
    ctx.lineTo(-25, 0);
    ctx.lineTo(-15, 5);
    ctx.strokeStyle = "orange";
    ctx.stroke();
  }

  ctx.restore();

  // Timer
  if (!gameOver) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`${elapsed}s`, canvas.width - 20, canvas.height - 20);
  }

  // Fuel bar
  const barWidth = 150;
  const barHeight = 15;
  const fuelPercent = fuel / MAX_FUEL;

  ctx.strokeStyle = "white";
  ctx.strokeRect(20, canvas.height - 30, barWidth, barHeight);

  ctx.fillStyle = "lime";
  ctx.fillRect(
    20,
    canvas.height - 30,
    barWidth * fuelPercent,
    barHeight
  );

  // Game Over
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Game Over - Press Space to Restart",
      canvas.width / 2,
      canvas.height / 2
    );
  }
}