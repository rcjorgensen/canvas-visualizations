const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// Center of rectangle
const RECT_X = CANVAS_WIDTH / 2;
const RECT_Y = CANVAS_HEIGHT / 2;

const params = new URL(document.location).searchParams;
const rectWidth = parseInt(params.get("rw") ?? 400);
const rectHeight = parseInt(params.get("rh") ?? 300);
const radius = parseInt(params.get("r") ?? 100);

const topX = RECT_X - rectWidth / 2;
const topY = RECT_Y - rectHeight / 2;

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvasRect = canvas.getBoundingClientRect();

canvas.onclick = (e) => {
  const cx = e.clientX - canvasRect.left;
  const cy = e.clientY - canvasRect.top;

  draw();

  const result = collides(
    cx,
    cy,
    radius,
    RECT_X,
    RECT_Y,
    rectWidth,
    rectHeight,
  );
  if (result.collides) {
    ctx.strokeStyle = "green";
  } else {
    ctx.strokeStyle = "red";
  }

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeRect(cx, cy, 1, 1);

  ctx.font = "30px Arial";
  ctx.strokeText(result.message, 10, CANVAS_HEIGHT - 10);
};

draw();

function draw() {
  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw rectangle
  ctx.strokeStyle = "coral";
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.rect(topX, topY, rectWidth, rectHeight);
  ctx.stroke();

  // Draw bounding rectangle
  ctx.strokeStyle = "#6A5ACD";
  const topBX = topX - radius;
  const topBY = topY - radius;
  const rectBWidth = rectWidth + 2 * radius;
  const rectBHeight = rectHeight + 2 * radius;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.rect(topBX, topBY, rectBWidth, rectBHeight);
  ctx.stroke();

  // Draw corner boundaries
  ctx.moveTo(topX, topY - radius);
  ctx.lineTo(topX, topY);
  ctx.lineTo(topX - radius, topY);
  ctx.moveTo(topX + rectWidth, topY - radius);
  ctx.lineTo(topX + rectWidth, topY);
  ctx.lineTo(topX + rectWidth + radius, topY);
  ctx.moveTo(topX + rectWidth + radius, topY + rectHeight);
  ctx.lineTo(topX + rectWidth, topY + rectHeight);
  ctx.lineTo(topX + rectWidth, topY + rectHeight + radius);
  ctx.moveTo(topX - radius, topY + rectHeight);
  ctx.lineTo(topX, topY + rectHeight);
  ctx.lineTo(topX, topY + rectHeight + radius);
  ctx.stroke();

  // Draw collision border for circles with given radius
  ctx.strokeStyle = "teal";
  ctx.setLineDash([15, 5]);
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
}

function collides(cx, cy, rad, rx, ry, rw, rh) {
  const distX = Math.abs(cx - rx);
  const distY = Math.abs(cy - ry);
  const rwHalf = rw / 2;
  const rhHalf = rh / 2;

  if (distX > rw / 2 + rad || distY > rh / 2 + rad) {
    return { collides: false, message: "Outside bounding rectangle" };
  }

  if (distX <= rwHalf || distY <= rhHalf) {
    return {
      collides: true,
      message: "Inside collision border, but not in the corner",
    };
  }

  const distToCornerSqrd = (cx - rx - rwHalf) ** 2 + (cy - ry - rhHalf) ** 2;
  if (distToCornerSqrd <= rad ** 2) {
    return {
      collides: true,
      message: "Inside corner of collision border",
    };
  }

  return {
    collides: false,
    message:
      "Inside corner of bounding rectangle, but outside collision border",
  };
}
