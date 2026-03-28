// Rocket
export const rocket = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  angle: 0,
  radius: 10,
};

// Fuel (reduced to 1/3)
export const MAX_FUEL = 33;
export let fuel = MAX_FUEL;

export function setFuel(value) {
  fuel = value;
}

// Planets
export let planets = [];

// Fuel pickups
export let fuelPickups = [];

// Player spawn position helper
function getPlayerStart(canvas) {
  return {
    x: canvas.width * (1 / 8),
    y: canvas.height * (7 / 8),
  };
}

// Initialize rocket
export function setRocketStart(canvas) {
  const start = getPlayerStart(canvas);
  rocket.x = start.x;
  rocket.y = start.y;
  rocket.vx = 0;
  rocket.vy = 0;
  rocket.angle = 0;
}

// 🔍 Position validation helper
function isPositionValid(x, y, radius, canvas) {
  const padding = 80; // buffer distance

  // 1. Avoid player start area
  const start = getPlayerStart(canvas);
  const dxStart = x - start.x;
  const dyStart = y - start.y;
  const distStart = Math.sqrt(dxStart * dxStart + dyStart * dyStart);

  if (distStart < padding) return false;

  // 2. Avoid other planets
  for (let planet of planets) {
    const dx = x - planet.x;
    const dy = y - planet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < planet.radius + radius + 20) {
      return false;
    }
  }

  return true;
}

// Generate planets + fuel
export function generatePlanets(canvas) {
  planets = [];
  fuelPickups = [];

  const planetCount = 2 + Math.floor(Math.random() * 2);

  // Generate planets safely
  let attempts = 0;
  while (planets.length < planetCount && attempts < 100) {
    attempts++;

    const radius = 25 + Math.random() * 25;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    if (!isPositionValid(x, y, radius, canvas)) continue;

    planets.push({
      x,
      y,
      radius,
      mass: 1000 + Math.random() * 1500,
    });
  }

  // Generate fuel pickups safely
  const fuelCount = 2 + Math.floor(Math.random() * 2);
  attempts = 0;

  while (fuelPickups.length < fuelCount && attempts < 100) {
    attempts++;

    const radius = 10;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    // Check against planets
    let valid = true;

    for (let planet of planets) {
      const dx = x - planet.x;
      const dy = y - planet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < planet.radius + radius + 10) {
        valid = false;
        break;
      }
    }

    // Check player start area
    const start = getPlayerStart(canvas);
    const dxStart = x - start.x;
    const dyStart = y - start.y;
    const distStart = Math.sqrt(dxStart * dxStart + dyStart * dyStart);

    if (distStart < 80) valid = false;

    if (!valid) continue;

    fuelPickups.push({
      x,
      y,
      radius,
    });
  }
}