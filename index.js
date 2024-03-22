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

let showLabels = true;
let showIntersections = true;

const canvas = document.getElementById("myCanvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

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

  drawLabels(ctx);
  drawIntersections(ctx);
}

function drawLabels(ctx) {
  if (showLabels) {
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
  const c = distSqrd(RECT, CIRCLE) - CIRCLE.radius ** 2;
  const b = 2 * (RECT.y - CIRCLE.y);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const y0 = (1 / 2) * (-b + Math.sqrt(det));
    const y1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (RECT.height >= 0 && 0 <= y0 && y0 <= RECT.height) ||
      (RECT.height < 0 && RECT.height <= y0 && y0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x - 3, RECT.y + y0 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${RECT.x}, ${(RECT.y + y0).toFixed(2)})`,
        RECT.x + 6,
        RECT.y + y0 + 6,
      );
    }

    if (
      (RECT.height >= 0 && 0 <= y1 && y1 <= RECT.height) ||
      (RECT.height < 0 && RECT.height <= y1 && y1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x - 3, RECT.y + y1 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${RECT.x}, ${(RECT.y + y1).toFixed(2)})`,
        RECT.x + 6,
        RECT.y + y1 + 6,
      );
    }
  }
}

function drawRightIntersections(ctx) {
  const c =
    distSqrd({ x: RECT.x + RECT.width, y: RECT.y }, CIRCLE) -
    CIRCLE.radius ** 2;
  const b = 2 * (RECT.y - CIRCLE.y);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const y0 = (1 / 2) * (-b + Math.sqrt(det));
    const y1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (RECT.height >= 0 && 0 <= y0 && y0 <= RECT.height) ||
      (RECT.height < 0 && RECT.height <= y0 && y0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x + RECT.width - 3, RECT.y + y0 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${RECT.x + RECT.width}, ${(RECT.y + y0).toFixed(2)})`,
        RECT.x + RECT.width + 6,
        RECT.y + y0 + 6,
      );
    }

    if (
      (RECT.height >= 0 && 0 <= y1 && y1 <= RECT.height) ||
      (RECT.height < 0 && RECT.height <= y1 && y1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x + RECT.width - 3, RECT.y + y1 - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${RECT.x + RECT.width}, ${(RECT.y + y1).toFixed(2)})`,
        RECT.x + RECT.width + 6,
        RECT.y + y1 + 6,
      );
    }
  }
}

function drawTopIntersections(ctx) {
  const c = distSqrd(RECT, CIRCLE) - CIRCLE.radius ** 2;
  const b = 2 * (RECT.x - CIRCLE.x);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const x0 = (1 / 2) * (-b + Math.sqrt(det));
    const x1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (RECT.width >= 0 && 0 <= x0 && x0 <= RECT.width) ||
      (RECT.width < 0 && RECT.width <= x0 && x0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x + x0 - 3, RECT.y - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(RECT.x + x0).toFixed(2)}, ${RECT.y})`,
        RECT.x + x0 + 6,
        RECT.y + 6,
      );
    }

    if (
      (RECT.width >= 0 && 0 <= x1 && x1 <= RECT.width) ||
      (RECT.width < 0 && RECT.width <= x1 && x1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x + x1 - 3, RECT.y - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(RECT.x + x1).toFixed(2)}, ${RECT.y})`,
        RECT.x + x1 + 6,
        RECT.y + 6,
      );
    }
  }
}

function drawBottomIntersections(ctx) {
  const c =
    distSqrd({ x: RECT.x, y: RECT.y + RECT.height }, CIRCLE) -
    CIRCLE.radius ** 2;
  const b = 2 * (RECT.x - CIRCLE.x);
  const det = b ** 2 - 4 * c;
  if (det >= 0) {
    const x0 = (1 / 2) * (-b + Math.sqrt(det));
    const x1 = (1 / 2) * (-b - Math.sqrt(det));

    ctx.strokeStyle = "red";
    if (
      (RECT.width >= 0 && 0 <= x0 && x0 <= RECT.width) ||
      (RECT.width < 0 && RECT.width <= x0 && x0 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x + x0 - 3, RECT.y + RECT.height - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(RECT.x + x0).toFixed(2)}, ${RECT.y + RECT.height})`,
        RECT.x + x0 + 6,
        RECT.y + RECT.height + 6,
      );
    }

    if (
      (RECT.width >= 0 && 0 <= x1 && x1 <= RECT.width) ||
      (RECT.width < 0 && RECT.width <= x1 && x1 <= 0)
    ) {
      // Intersection
      ctx.beginPath();
      ctx.rect(RECT.x + x1 - 3, RECT.y + RECT.height - 3, 6, 6);
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(
        `(${(RECT.x + x1).toFixed(2)}, ${RECT.y + RECT.height})`,
        RECT.x + x1 + 6,
        RECT.y + RECT.height + 6,
      );
    }
  }
}

function distSqrd(p1, p2) {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}
