const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Center of rectangle
const RECT_X = CANVAS_WIDTH / 2;
const RECT_Y = CANVAS_HEIGHT / 2;

const params = new URL(document.location).searchParams;
const rectWidth = parseInt(params.get("rw") ?? 200);
const rectHeight = parseInt(params.get("rh") ?? 150);
const radius = parseInt(params.get("r") ?? 50);

const topX = RECT_X - rectWidth / 2;
const topY = RECT_Y - rectHeight / 2;

const canvas = document.getElementById("myCanvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const ctx = canvas.getContext("2d");

ctx.fillStyle = "#202020";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw rectangle
ctx.strokeStyle = "coral";
ctx.beginPath();
ctx.rect(topX, topY, rectWidth, rectHeight);
ctx.stroke();

// Draw bounding rectangle
ctx.strokeStyle = "lavender";
const topBX = topX - radius;
const topBY = topY - radius;
const rectBWidth = rectWidth + 2 * radius;
const rectBHeight = rectHeight + 2 * radius;
ctx.setLineDash([2, 2]);
ctx.beginPath();
ctx.rect(topBX, topBY, rectBWidth, rectBHeight);
ctx.stroke();

// Draw collision border for circles with given radius
ctx.strokeStyle = "teal";
ctx.beginPath();
ctx.arc(topX, topY, radius, Math.PI, (3 * Math.PI) / 2);
ctx.stroke();
ctx.beginPath();
ctx.arc(topX + rectWidth, topY, radius, (3 * Math.PI) / 2, 0);
ctx.stroke();
ctx.beginPath();
ctx.arc(topX + rectWidth, topY + rectHeight, radius, 0, Math.PI / 2);
ctx.stroke();
ctx.beginPath();
ctx.arc(topX, topY + rectHeight, radius, Math.PI / 2, Math.PI);
ctx.stroke();
