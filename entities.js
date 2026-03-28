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
export const MAX_FUEL = 100;
export let fuel = MAX_FUEL;

export function setFuel(value) {
  fuel = value;
}

// Planets
export let planets = [];

// Fuel pickups
export let fuelPickups = [];

// Initialize rocket
export function setRocketStart(canvas) {
  rocket.x = canvas.width * (1 / 8);
  rocket.y = canvas.height * (7 / 8);
  rocket.vx = 0;
  rocket.vy = 0;
  rocket.angle = 0;
}

// Generate planets + fuel
export function generatePlanets(canvas) {
  planets = [];

  const count = 2 + Math.floor(Math.random() * 2);

  for (let i = 0; i < count; i++) {
    planets.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      mass: 1000 + Math.random() * 1500,
      radius: 25 + Math.random() * 25,
    });
  }

  // Fuel pickups
  fuelPickups = [];
  const fuelCount = 2 + Math.floor(Math.random() * 2);

  for (let i = 0; i < fuelCount; i++) {
    fuelPickups.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 10,
    });
  }
}