const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const rect = {
  x: 350,
  y: 260,
  width: 200,
  height: 160,
};

const circle = {
  x: 300,
  y: 300,
  radius: 120,
};

let showLabels = true;
let showIntersections = true;

const canvas = document.getElementById("my-canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

draw();

const inputCircleX = document.getElementById("circle-x");
inputCircleX.min = -CANVAS_WIDTH;
inputCircleX.max = CANVAS_WIDTH;
inputCircleX.value = circle.x;
inputCircleX.oninput = (e) => {
  circle.x = parseInt(e.target.value);
  draw();
};

const inputCircleY = document.getElementById("circle-y");
inputCircleY.min = -CANVAS_HEIGHT;
inputCircleY.max = CANVAS_HEIGHT;
inputCircleY.value = circle.y;
inputCircleY.oninput = (e) => {
  circle.y = parseInt(e.target.value);
  draw();
};

const inputRadius = document.getElementById("radius");
inputRadius.min = 0;
inputRadius.max = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
inputRadius.value = circle.radius;
inputRadius.oninput = (e) => {
  circle.radius = parseInt(e.target.value);
  draw();
};

const inputRectX = document.getElementById("rect-x");
inputRectX.min = -CANVAS_WIDTH;
inputRectX.max = CANVAS_WIDTH;
inputRectX.value = rect.x;
inputRectX.oninput = (e) => {
  rect.x = parseInt(e.target.value);
  draw();
};

const inputRectY = document.getElementById("rect-y");
inputRectY.min = -CANVAS_HEIGHT;
inputRectY.max = CANVAS_HEIGHT;
inputRectY.value = rect.y;
inputRectY.oninput = (e) => {
  rect.y = parseInt(e.target.value);
  draw();
};

const inputWidth = document.getElementById("width");
inputWidth.min = -CANVAS_WIDTH;
inputWidth.max = CANVAS_WIDTH;
inputWidth.value = rect.width;
inputWidth.oninput = (e) => {
  rect.width = parseInt(e.target.value);
  draw();
};

const inputHeight = document.getElementById("height");
inputHeight.min = -CANVAS_HEIGHT;
inputHeight.max = CANVAS_HEIGHT;
inputHeight.value = rect.height;
inputHeight.oninput = (e) => {
  rect.height = parseInt(e.target.value);
  draw();
};

const toggleLabels = (document.getElementById("toggle-labels").onclick = (
  e,
) => {
  showLabels = !showLabels;
  draw();
});

document.getElementById("toggle-intersections").onclick = (e) => {
  showIntersections = !showIntersections;
  draw();
};

function draw() {
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rectangle
  ctx.strokeStyle = "coral";
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.stroke();

  // Center of rectangle
  ctx.beginPath();
  ctx.strokeRect(rect.x + rect.width / 2, rect.y + rect.height / 2, 1, 1);

  // Circle
  ctx.strokeStyle = "teal";
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Center of circle
  ctx.beginPath();
  ctx.rect(circle.x, circle.y, 1, 1);
  ctx.stroke();

  // Radius of circle
  ctx.beginPath();
  ctx.moveTo(circle.x, circle.y);
  ctx.lineTo(circle.x - circle.radius, circle.y);
  ctx.stroke();

  drawLabels(ctx);
  drawIntersections(ctx);
}

function drawLabels(ctx) {
  if (showLabels) {
    // Text
    ctx.fillStyle = "white";
    ctx.fillText(`(${circle.x}, ${circle.y})`, circle.x - 25, circle.y - 5);
    ctx.fillText(
      `${circle.radius}`,
      circle.x - circle.radius / 2 - 20,
      circle.y - 5,
    );
    ctx.fillText(`(${rect.x}, ${rect.y})`, rect.x - 25, rect.y - 5);
    ctx.fillText(`${rect.height}`, rect.x - 5, rect.y + rect.height / 2);
    ctx.fillText(`${rect.width}`, rect.x + rect.width / 2 - 5, rect.y + 3);
  }
}

function drawIntersections(ctx) {
  if (showIntersections) {
    drawLeftIntersections(ctx);
    drawRightIntersections(ctx);
    drawTopIntersections(ctx);
    drawBottomIntersections(ctx);
  }
}

function drawLeftIntersections(ctx) {
  const c = distSqrd(rect, circle) - circle.radius ** 2;
  const b = 2 * (rect.y - circle.y);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const y0 = (1 / 2) * (-b + Math.sqrt(det));
    const y1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (rect.height >= 0 && 0 <= y0 && y0 <= rect.height) ||
      (rect.height < 0 && rect.height <= y0 && y0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x - 3, rect.y + y0 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${rect.x}, ${(rect.y + y0).toFixed(2)})`,
        rect.x + 6,
        rect.y + y0 + 6,
      );
    }

    if (
      (rect.height >= 0 && 0 <= y1 && y1 <= rect.height) ||
      (rect.height < 0 && rect.height <= y1 && y1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x - 3, rect.y + y1 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${rect.x}, ${(rect.y + y1).toFixed(2)})`,
        rect.x + 6,
        rect.y + y1 + 6,
      );
    }
  }
}

function drawRightIntersections(ctx) {
  const c =
    distSqrd({ x: rect.x + rect.width, y: rect.y }, circle) -
    circle.radius ** 2;
  const b = 2 * (rect.y - circle.y);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const y0 = (1 / 2) * (-b + Math.sqrt(det));
    const y1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (rect.height >= 0 && 0 <= y0 && y0 <= rect.height) ||
      (rect.height < 0 && rect.height <= y0 && y0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x + rect.width - 3, rect.y + y0 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${rect.x + rect.width}, ${(rect.y + y0).toFixed(2)})`,
        rect.x + rect.width + 6,
        rect.y + y0 + 6,
      );
    }

    if (
      (rect.height >= 0 && 0 <= y1 && y1 <= rect.height) ||
      (rect.height < 0 && rect.height <= y1 && y1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x + rect.width - 3, rect.y + y1 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${rect.x + rect.width}, ${(rect.y + y1).toFixed(2)})`,
        rect.x + rect.width + 6,
        rect.y + y1 + 6,
      );
    }
  }
}

function drawTopIntersections(ctx) {
  const c = distSqrd(rect, circle) - circle.radius ** 2;
  const b = 2 * (rect.x - circle.x);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const x0 = (1 / 2) * (-b + Math.sqrt(det));
    const x1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (rect.width >= 0 && 0 <= x0 && x0 <= rect.width) ||
      (rect.width < 0 && rect.width <= x0 && x0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x + x0 - 3, rect.y - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(rect.x + x0).toFixed(2)}, ${rect.y})`,
        rect.x + x0 + 6,
        rect.y + 6,
      );
    }

    if (
      (rect.width >= 0 && 0 <= x1 && x1 <= rect.width) ||
      (rect.width < 0 && rect.width <= x1 && x1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x + x1 - 3, rect.y - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(rect.x + x1).toFixed(2)}, ${rect.y})`,
        rect.x + x1 + 6,
        rect.y + 6,
      );
    }
  }
}

function drawBottomIntersections(ctx) {
  const c =
    distSqrd({ x: rect.x, y: rect.y + rect.height }, circle) -
    circle.radius ** 2;
  const b = 2 * (rect.x - circle.x);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const x0 = (1 / 2) * (-b + Math.sqrt(det));
    const x1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (rect.width >= 0 && 0 <= x0 && x0 <= rect.width) ||
      (rect.width < 0 && rect.width <= x0 && x0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x + x0 - 3, rect.y + rect.height - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(rect.x + x0).toFixed(2)}, ${rect.y + rect.height})`,
        rect.x + x0 + 6,
        rect.y + rect.height + 6,
      );
    }

    if (
      (rect.width >= 0 && 0 <= x1 && x1 <= rect.width) ||
      (rect.width < 0 && rect.width <= x1 && x1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(rect.x + x1 - 3, rect.y + rect.height - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(rect.x + x1).toFixed(2)}, ${rect.y + rect.height})`,
        rect.x + x1 + 6,
        rect.y + rect.height + 6,
      );
    }
  }
}

function distSqrd(p1, p2) {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}
