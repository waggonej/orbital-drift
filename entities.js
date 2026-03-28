// Rocket
export const rocket = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  angle: 0,
  radius: 10,
};

// Fuel
export const MAX_FUEL = 33;
export let fuel = MAX_FUEL;

export function setFuel(value) {
  fuel = value;
}

// Ammo
export let ammo = 10;
export function setAmmo(value) {
  ammo = value;
}

// Planets
export let planets = [];

// Fuel pickups
export let fuelPickups = [];

// Asteroids
export let asteroids = [];

// Lasers
export let lasers = [];

// Player start
function getPlayerStart(canvas) {
  return {
    x: canvas.width * (1 / 8),
    y: canvas.height * (7 / 8),
  };
}

// Rocket start
export function setRocketStart(canvas) {
  const start = getPlayerStart(canvas);
  rocket.x = start.x;
  rocket.y = start.y;
  rocket.vx = 0;
  rocket.vy = 0;
  rocket.angle = 0;
}

// Generate world
export function generatePlanets(canvas) {
  planets = [];
  fuelPickups = [];
  asteroids = [];
  lasers = [];
  ammo = 10;

  const planetCount = 2 + Math.floor(Math.random() * 2);

  for (let i = 0; i < planetCount; i++) {
    const radius = 25 + Math.random() * 25;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    const planet = {
      x,
      y,
      radius,
      mass: 1000 + Math.random() * 1500,
    };

    planets.push(planet);

    // Asteroids orbiting this planet
    const asteroidCount = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < asteroidCount; j++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = planet.radius + 50 + Math.random() * 50;

      asteroids.push({
        planet,
        angle,
        distance,
        speed: 0.01 + Math.random() * 0.01,
        radius: 6,
        x: 0,
        y: 0,
      });
    }
  }

  // Fuel pickups
  const fuelCount = 2 + Math.floor(Math.random() * 2);

  for (let i = 0; i < fuelCount; i++) {
    fuelPickups.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 10,
    });
  }
}