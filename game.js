import {
  rocket,
  fuel,
  setFuel,
  MAX_FUEL,
  planets,
  fuelPickups,
  setRocketStart,
  generatePlanets,
} from "./entities.js";

import { applyPhysics, simulateTrajectory } from "./physics.js";

const THRUST = 0.1;
const ROTATION_SPEED = 0.05;

let gameRunning = false;
let gameOver = false;
let startTime = 0;

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
};

export function initGame(canvas) {
  window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;

    if (e.code === "Space" && gameOver) resetGame(canvas);
    if (e.code === "Escape") returnToMenu(canvas);
  });

  window.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
  });
}

export function startGame(canvas) {
  generatePlanets(canvas);
  setRocketStart(canvas);
  setFuel(MAX_FUEL);

  gameRunning = true;
  gameOver = false;
  startTime = Date.now();

  gameLoop(canvas);
}

function returnToMenu(canvas) {
  gameRunning = false;
  gameOver = false;
  canvas.style.display = "none";
  document.getElementById("menu").style.display = "block";
}

function resetGame(canvas) {
  generatePlanets(canvas);
  setRocketStart(canvas);
  setFuel(MAX_FUEL);

  gameOver = false;
  startTime = Date.now();
}

function gameLoop(canvas) {
  update(canvas);
  draw(canvas);

  if (gameRunning) requestAnimationFrame(() => gameLoop(canvas));
}

function update(canvas) {
  if (gameOver) return;

  if (keys.ArrowLeft) rocket.angle -= ROTATION_SPEED;
  if (keys.ArrowRight) rocket.angle += ROTATION_SPEED;

  if (keys.ArrowUp && fuel > 0) {
    rocket.vx += Math.cos(rocket.angle) * THRUST;
    rocket.vy += Math.sin(rocket.angle) * THRUST;
    setFuel(Math.max(fuel - 0.2, 0));
  }

  const collision = applyPhysics(rocket);
  if (collision) gameOver = true;

  // Fuel pickup collision
  for (let i = fuelPickups.length - 1; i >= 0; i--) {
    const pickup = fuelPickups[i];

    const dx = pickup.x - rocket.x;
    const dy = pickup.y - rocket.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < pickup.radius + rocket.radius) {
      setFuel(Math.min(fuel + 30, MAX_FUEL));
      fuelPickups.splice(i, 1);
    }
  }
}

function draw(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Planets
  planets.forEach((planet) => {
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "blue";
    ctx.stroke();
  });

  // Fuel pickups
  ctx.fillStyle = "yellow";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";

  fuelPickups.forEach((pickup) => {
    ctx.fillText("F", pickup.x, pickup.y);
  });

  // Trajectory
  const points = simulateTrajectory(rocket);
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.stroke();

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

  ctx.restore();

  // Timer
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  ctx.fillStyle = "white";
  ctx.fillText(`${elapsed}s`, canvas.width - 60, canvas.height - 20);

  // Fuel bar
  const barWidth = 150;
  const barHeight = 10;
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

  if (gameOver) {
    ctx.fillText("Game Over - Press Space", canvas.width / 2, canvas.height / 2);
  }
}