import { initGame, startGame } from "./game.js";

const canvas = document.getElementById("gameCanvas");
const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");

// Setup canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

initGame(canvas);

startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  canvas.style.display = "block";
  startGame(canvas);
});