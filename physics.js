import { planets, asteroids } from "./entities.js";

const G = 0.5;
const FRICTION = 0.999;

// Rocket physics
export function applyPhysics(rocket) {
  for (let planet of planets) {
    const dx = planet.x - rocket.x;
    const dy = planet.y - rocket.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < planet.radius + rocket.radius) {
      return true;
    }

    const force = (G * planet.mass) / (distance * distance);
    const angle = Math.atan2(dy, dx);

    rocket.vx += Math.cos(angle) * force;
    rocket.vy += Math.sin(angle) * force;
  }

  rocket.x += rocket.vx;
  rocket.y += rocket.vy;

  rocket.vx *= FRICTION;
  rocket.vy *= FRICTION;

  // Screen wrap
  if (rocket.x < 0) rocket.x = window.innerWidth;
  if (rocket.x > window.innerWidth) rocket.x = 0;
  if (rocket.y < 0) rocket.y = window.innerHeight;
  if (rocket.y > window.innerHeight) rocket.y = 0;

  return false;
}

// Asteroid orbiting
export function updateAsteroids() {
  asteroids.forEach((a) => {
    a.angle += a.speed;

    a.x = a.planet.x + Math.cos(a.angle) * a.distance;
    a.y = a.planet.y + Math.sin(a.angle) * a.distance;
  });
}

// Trajectory
export function simulateTrajectory(rocket) {
  let simX = rocket.x;
  let simY = rocket.y;
  let simVX = rocket.vx;
  let simVY = rocket.vy;

  const TIME_STEP = 0.5;
  const points = [];

  for (let i = 0; i < 300; i++) {
    for (let planet of planets) {
      const dx = planet.x - simX;
      const dy = planet.y - simY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < planet.radius + rocket.radius) {
        points.push({ x: simX, y: simY });
        return points;
      }

      const force = (G * planet.mass) / (distance * distance);
      const angle = Math.atan2(dy, dx);

      simVX += Math.cos(angle) * force * TIME_STEP;
      simVY += Math.sin(angle) * force * TIME_STEP;
    }

    simVX *= FRICTION;
    simVY *= FRICTION;

    simX += simVX * TIME_STEP;
    simY += simVY * TIME_STEP;

    points.push({ x: simX, y: simY });
  }

  return points;
}