import {
  rocket,
  fuel,
  setFuel,
  MAX_FUEL,
  planets,
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
    setFuel(fuel - 0.2);
  }

  const collision = applyPhysics(rocket);
  if (collision) gameOver = true;
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
  ctx.fillText(`${elapsed}s`, canvas.width - 60, canvas.height - 20);

  // Fuel bar
  ctx.fillRect(20, canvas.height - 30, 150 * (fuel / MAX_FUEL), 10);

  if (gameOver) {
    ctx.fillText("Game Over - Press Space", canvas.width / 2, canvas.height / 2);
  }
}