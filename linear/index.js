// data structures

class Rectangle {
  constructor(xlow, ylow, width, height) {
    this.xlow = xlow;
    this.ylow = ylow;
    this.width = width;
    this.height = height;
  }

  get xhigh() {
    return this.xlow + this.width;
  }

  get yhigh() {
    return this.ylow + this.height;
  }

  get cx() {
    return this.xlow + this.width / 2;
  }

  get cy() {
    return this.ylow + this.height / 2;
  }

  contains(rect) {
    if (rect.xlow < this.xlow) return false;
    if (rect.xhigh >= this.xhigh) return false;
    if (rect.ylow < this.ylow) return false;
    if (rect.yhigh >= this.yhigh) return false;
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
const maxDepth = parseInt(params.get("maxDepth") ?? 8);
const radius = parseInt(params.get("radius") ?? 12);
const diameter = radius * 2;
const mean = parseInt(params.get("mean") ?? diameter);
const stdDev = parseInt(params.get("stdDev") ?? 6);
const canvasWidth = parseInt(params.get("canvasWidth") ?? 1600);
const canvasHeight = parseInt(params.get("canvasHeight") ?? 1200);

let selected;
const rectangles = [];
const collisionMap = new Map();

const seed = 1337 ^ 0xdeadbeef;
const rand = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed);

for (let i = 0; i < count; ++i) {
  const cx = Math.floor(rand() * canvasWidth);
  const cy = Math.floor(rand() * canvasHeight);
  const width = normal();
  const height = normal();

  const rect = new Rectangle(cx - width / 2, cy - height / 2, width, height);

  rectangles.push(rect);
  collisionMap.set(rect, []);
}

const start = performance.now();

for (let rect of rectangles) {
  if (rect.width <= diameter || rect.height <= diameter) {
    for (let cand of rectangles) {
      if (cand !== rect) {
        const distX = Math.abs(rect.cx - cand.cx);
        const distY = Math.abs(rect.cy - cand.cy);

        const rectWidthHalf = cand.width / 2;
        const rectHeightHalf = cand.height / 2;

        if (
          distX <= rectWidthHalf + radius &&
          distY <= rectHeightHalf + radius &&
          (distX <= rectWidthHalf ||
            distY <= rectHeightHalf ||
            (distX - rectWidthHalf) ** 2 + (distY - rectHeightHalf) ** 2 <=
              radius ** 2)
        ) {
          collisionMap.get(rect).push(cand);
        }
      }
    }
  }
}

const elapsed = performance.now() - start;

let wellsized = 0;
let undersized = 0;
let underspaced = 0;
for (let [key, value] of collisionMap) {
  if (key.width <= diameter || key.height <= diameter) {
    if (value.length > 0) {
      ++underspaced;
    } else {
      ++undersized;
    }
  } else {
    ++wellsized;
  }
}
const output = document.getElementById("message");
output.innerHTML +=
  `<p>Linear spacing calculation for ${rectangles.length} rectangles took ${elapsed.toFixed(2)} ms` +
  ` | <span style="color: #98FB98">Wellsized</span> rectangles: ${wellsized}` +
  ` | <span style="color: #FFFF99">Undersized</span> rectangles: ${undersized}` +
  ` | <span style="color: #FFC0CB">Underspaced</span> rectangles: ${underspaced}</p>`;

// draw

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.2;
  for (let rect of rectangles) {
    const neighbors = collisionMap.get(rect);

    if (rect === selected) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#FFFF99";
      ctx.strokeRect(rect.xlow, rect.ylow, rect.width, rect.height);

      ctx.beginPath();
      ctx.arc(rect.cx, rect.cy, radius, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = "#ADD8E6";
      for (let nbor of neighbors) {
        ctx.strokeRect(nbor.xlow, nbor.ylow, nbor.width, nbor.height);
      }

      ctx.globalAlpha = 0.2;
    }

    if (rect.width <= 24 || rect.height <= 24) {
      if (neighbors.length > 0) {
        ctx.fillStyle = "#FFC0CB";
      } else {
        ctx.fillStyle = "#FFFF99";
      }
    } else {
      ctx.fillStyle = "#98FB98";
    }
    ctx.fillRect(rect.xlow, rect.ylow, rect.width, rect.height);
  }
  ctx.globalAlpha = 1;
}

// handlers

canvas.onclick = (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  selected = null;
  for (let rect of rectangles) {
    if (
      rect.xlow <= x &&
      x <= rect.xhigh &&
      rect.ylow <= y &&
      y <= rect.yhigh
    ) {
      selected = rect;
    }
  }

  draw();
};

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
