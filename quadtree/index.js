// constants

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const RADIUS = 12;

const MAX_DEPTH = 8;

// classes

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Rectangle {
  constructor(center, size) {
    this.center = center;
    this.size = size;
  }

  get xlow() {
    return this.center.x - this.size.x / 2;
  }

  get ylow() {
    return this.center.y - this.size.y / 2;
  }

  get xhigh() {
    return this.center.x + this.size.x / 2;
  }

  get yhigh() {
    return this.center.y + this.size.y / 2;
  }

  get width() {
    return this.size.x;
  }

  get height() {
    return this.size.y;
  }

  contains(rect) {
    if (rect.xlow < this.xlow) return false;
    if (rect.xhigh > this.xhigh) return false;
    if (rect.ylow < this.ylow) return false;
    if (rect.yhigh > this.yhigh) return false;
    return true;
  }

  overlaps(rect) {
    if (rect.xhigh < this.xlow) return false;
    if (rect.xlow > this.xhigh) return false;
    if (rect.yhigh < this.ylow) return false;
    if (rect.ylow > this.yhigh) return false;
    return true;
  }
}

// setup state

const params = new URL(document.location).searchParams;
const count = parseInt(params.get("count") ?? 400);
const mean = parseInt(params.get("mean") ?? 24);
const stdDev = parseInt(params.get("stdDev") ?? 6);

const rectangles = [];

const seed = 1337 ^ 0xdeadbeef;
const rand = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed);

for (let i = 0; i < count; ++i) {
  const rect = new Rectangle(
    new Vector(
      Math.floor(rand() * CANVAS_WIDTH),
      Math.floor(rand() * CANVAS_HEIGHT),
    ),
    new Vector(normal(), normal()),
  );

  rectangles.push(rect);
}

const start = performance.now();

// Strategy: Build Quadtree from the padded rectangles

// Step 1:

// "#FFC0CB":
const end = performance.now();

const output = document.getElementById("output");
output.innerHTML += `<p>Spacing calculation for ${rectangles.length} rectangles took ${(end - start).toFixed(2)} ms</p>`;

// draw

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.2;
  rectangles.forEach((rect, i) => {
    ctx.fillStyle = "#ADD8E6";
    ctx.fillRect(rect.xlow, rect.ylow, rect.width, rect.height);

    if (rect.width <= 24 || rect.height <= 24) {
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = "#FFFF99";
      const boundingRect = new Rectangle(
        rect.center,
        new Vector(Math.max(rect.width, 24), Math.max(rect.height, 24)),
      );
      ctx.strokeRect(
        boundingRect.xlow,
        boundingRect.ylow,
        boundingRect.width,
        boundingRect.height,
      );
    } else {
    }
  });
  ctx.globalAlpha = 1;
}

// handlers

// helpers

function sfc32(a, b, c, d) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    let t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function normal() {
  const y1 = rand();
  const y2 = rand();

  return (
    mean + stdDev * Math.cos(2 * Math.PI * y2) * Math.sqrt(-2 * Math.log(y1))
  );
}
