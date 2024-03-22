const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const RECT = {
  x: 350,
  y: 260,
  width: 200,
  height: 160,
};

const CIRCLE = {
  x: 300,
  y: 300,
  radius: 120,
};

draw();

const inputCircleX = document.getElementById("circle-x");
inputCircleX.min = -CANVAS_WIDTH;
inputCircleX.max = CANVAS_WIDTH;
inputCircleX.value = CIRCLE.x;
inputCircleX.oninput = (e) => {
  CIRCLE.x = parseInt(e.target.value);
  draw();
};

const inputCircleY = document.getElementById("circle-y");
inputCircleY.min = -CANVAS_HEIGHT;
inputCircleY.max = CANVAS_HEIGHT;
inputCircleY.value = CIRCLE.y;
inputCircleY.oninput = (e) => {
  CIRCLE.y = parseInt(e.target.value);
  draw();
};

const inputRadius = document.getElementById("radius");
inputRadius.min = 0;
inputRadius.max = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
inputRadius.value = CIRCLE.radius;
inputRadius.oninput = (e) => {
  CIRCLE.radius = parseInt(e.target.value);
  draw();
};

const inputRectX = document.getElementById("rect-x");
inputRectX.min = -CANVAS_WIDTH;
inputRectX.max = CANVAS_WIDTH;
inputRectX.value = RECT.x;
inputRectX.oninput = (e) => {
  RECT.x = parseInt(e.target.value);
  draw();
};

const inputRectY = document.getElementById("rect-y");
inputRectY.min = -CANVAS_HEIGHT;
inputRectY.max = CANVAS_HEIGHT;
inputRectY.value = RECT.y;
inputRectY.oninput = (e) => {
  RECT.y = parseInt(e.target.value);
  draw();
};

const inputWidth = document.getElementById("width");
inputWidth.min = -CANVAS_WIDTH;
inputWidth.max = CANVAS_WIDTH;
inputWidth.value = RECT.width;
inputWidth.oninput = (e) => {
  RECT.width = parseInt(e.target.value);
  draw();
};

const inputHeight = document.getElementById("height");
inputHeight.min = -CANVAS_HEIGHT;
inputHeight.max = CANVAS_HEIGHT;
inputHeight.value = RECT.height;
inputHeight.oninput = (e) => {
  RECT.height = parseInt(e.target.value);
  draw();
};

function draw() {
  const canvas = document.getElementById("myCanvas");

  const ctx = canvas.getContext("2d");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rectangle
  ctx.strokeStyle = "coral";
  ctx.beginPath();
  ctx.rect(RECT.x, RECT.y, RECT.width, RECT.height);
  ctx.stroke();

  // Center of rectangle
  ctx.beginPath();
  ctx.strokeRect(RECT.x + RECT.width / 2, RECT.y + RECT.height / 2, 1, 1);

  // Circle
  ctx.strokeStyle = "teal";
  ctx.beginPath();
  ctx.arc(CIRCLE.x, CIRCLE.y, CIRCLE.radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Center of circle
  ctx.beginPath();
  ctx.rect(CIRCLE.x, CIRCLE.y, 1, 1);
  ctx.stroke();

  // Radius of circle
  ctx.beginPath();
  ctx.moveTo(CIRCLE.x, CIRCLE.y);
  ctx.lineTo(CIRCLE.x - CIRCLE.radius, CIRCLE.y);
  ctx.stroke();

  // Text
  ctx.fillStyle = "white";
  ctx.fillText(`(${CIRCLE.x}, ${CIRCLE.y})`, CIRCLE.x - 25, CIRCLE.y - 5);
  ctx.fillText(
    `${CIRCLE.radius}`,
    CIRCLE.x - CIRCLE.radius / 2 - 20,
    CIRCLE.y - 5,
  );
  ctx.fillText(`(${RECT.x}, ${RECT.y})`, RECT.x - 25, RECT.y - 5);
  ctx.fillText(`${RECT.height}`, RECT.x - 5, RECT.y + RECT.height / 2);
  ctx.fillText(`${RECT.width}`, RECT.x + RECT.width / 2 - 5, RECT.y + 3);
}
