import {
  rocket,
  fuel,
  setFuel,
  MAX_FUEL,
  planets,
  fuelPickups,
  asteroids,
  lasers,
  particles,
  ammo,
  setAmmo,
  setRocketStart,
  generatePlanets,
} from "./entities.js";

import {
  applyPhysics,
  simulateTrajectory,
  updateAsteroids,
} from "./physics.js";

const THRUST = 0.1;
const ROTATION_SPEED = 0.05;

let gameRunning = false;
let gameOver = false;
let startTime = 0;

let isExploding = false;
let explosionTimer = 0;

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
};

export function initGame(canvas) {
  window.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;

    if (e.key.toLowerCase() === "f" && ammo > 0 && !isExploding) {
      lasers.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(rocket.angle) * 6,
        vy: Math.sin(rocket.angle) * 6,
        life: 100,
      });

      setAmmo(ammo - 1);
    }

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
  isExploding = false;
  explosionTimer = 0;

  startTime = Date.now();

  gameLoop(canvas);
}

function returnToMenu(canvas) {
  gameRunning = false;
  gameOver = false;
  isExploding = false;
  explosionTimer = 0;
  particles.length = 0;

  canvas.style.display = "none";
  document.getElementById("menu").style.display = "block";
}

function resetGame(canvas) {
  generatePlanets(canvas);
  setRocketStart(canvas);
  setFuel(MAX_FUEL);

  gameOver = false;
  isExploding = false;
  explosionTimer = 0;
  particles.length = 0;

  startTime = Date.now();
}

function triggerExplosion() {
  if (isExploding) return;

  isExploding = true;
  explosionTimer = 120; // ~2 seconds

  // Neon blue explosion (bigger)
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: rocket.x,
      y: rocket.y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      life: 60,
      color: "cyan",
    });
  }
}

function gameLoop(canvas) {
  update(canvas);
  draw(canvas);

  if (gameRunning) requestAnimationFrame(() => gameLoop(canvas));
}

function update(canvas) {
  if (gameOver) return;

  // Handle explosion timing (DO NOT STOP LOOP)
  if (isExploding) {
    explosionTimer--;

    if (explosionTimer <= 0) {
      gameOver = true;
      isExploding = false;
    }
  }

  // Only allow gameplay if NOT exploding
  if (!isExploding) {
    if (keys.ArrowLeft) rocket.angle -= ROTATION_SPEED;
    if (keys.ArrowRight) rocket.angle += ROTATION_SPEED;

    if (keys.ArrowUp && fuel > 0) {
      rocket.vx += Math.cos(rocket.angle) * THRUST;
      rocket.vy += Math.sin(rocket.angle) * THRUST;
      setFuel(Math.max(fuel - 0.2, 0));
    }

    const collision = applyPhysics(rocket);
    if (collision) triggerExplosion();

    updateAsteroids();

    // Ship collision with asteroids
    for (let a of asteroids) {
      const dx = rocket.x - a.x;
      const dy = rocket.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < rocket.radius + a.radius) {
        triggerExplosion();
      }
    }

    // Laser updates
    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];

      l.x += l.vx;
      l.y += l.vy;
      l.life--;

      if (l.life <= 0) {
        lasers.splice(i, 1);
        continue;
      }

      for (let j = asteroids.length - 1; j >= 0; j--) {
        const a = asteroids[j];

        const dx = l.x - a.x;
        const dy = l.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < a.radius) {
          // Asteroid explosion
          for (let k = 0; k < 10; k++) {
            particles.push({
              x: a.x,
              y: a.y,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              life: 30,
              color: "orange",
            });
          }

          asteroids.splice(j, 1);
          lasers.splice(i, 1);
          break;
        }
      }
    }

    // Fuel pickups
    for (let i = fuelPickups.length - 1; i >= 0; i--) {
      const pickup = fuelPickups[i];

      const dx = pickup.x - rocket.x;
      const dy = pickup.y - rocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < pickup.radius + rocket.radius) {
        setFuel(Math.min(fuel + 10, MAX_FUEL));
        fuelPickups.splice(i, 1);
      }
    }
  }

  // ALWAYS update particles (even during explosion)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function draw(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Planets
  planets.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "blue";
    ctx.stroke();
  });

  // Asteroids
  ctx.fillStyle = "gray";
  asteroids.forEach((a) => {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Particles
  particles.forEach((p) => {
    ctx.globalAlpha = p.life / 60;
    ctx.fillStyle = p.color || "orange";
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1;

  // Fuel pickups
  ctx.fillStyle = "yellow";
  fuelPickups.forEach((f) => {
    ctx.fillText("F", f.x, f.y);
  });

  // Lasers
  ctx.fillStyle = "red";
  lasers.forEach((l) => {
    ctx.beginPath();
    ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
    ctx.fill();
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

  // Rocket (hidden during explosion)
  if (!isExploding) {
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
  }

  // UI
  ctx.fillStyle = "white";
  ctx.fillText(`Ammo: ${ammo}`, 20, canvas.height - 50);

  const fuelPercent = fuel / MAX_FUEL;
  ctx.strokeRect(20, canvas.height - 30, 150, 10);
  ctx.fillRect(20, canvas.height - 30, 150 * fuelPercent, 10);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  ctx.fillText(`${elapsed}s`, canvas.width - 60, canvas.height - 20);

  if (gameOver) {
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  }
}