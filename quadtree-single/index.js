const YELLOW = "yellow";
const GREEN = "green";
const BLUE = "blue";
const RED = "red";
const WHITE = "white";

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

class QuadTree {
  constructor(rect, depth = 0) {
    this.rect = rect;
    this.depth = depth;

    const childWidth = rect.width / 2;
    const childHeight = rect.height / 2;
    this.childRects = [
      // top left
      new Rectangle(rect.xlow, rect.ylow, childWidth, childHeight),
      // top right
      new Rectangle(rect.xlow + childWidth, rect.ylow, childWidth, childHeight),
      // bottom left
      new Rectangle(
        rect.xlow,
        rect.ylow + childHeight,
        childWidth,
        childHeight,
      ),
      // bottom right
      new Rectangle(
        rect.xlow + childWidth,
        rect.ylow + childHeight,
        childWidth,
        childHeight,
      ),
    ];

    this.children = [];
    this.items = [];
  }

  insert(item, boundingRect) {
    if (this.depth <= maxDepth) {
      for (let i = 0; i < 4; ++i) {
        if (this.childRects[i].contains(boundingRect)) {
          if (this.children[i] === undefined) {
            this.children[i] = new QuadTree(this.childRects[i], this.depth + 1);
          }

          this.children[i].insert(item, boundingRect);
          return;
        }
      }
    }

    // If we reached the maximum depth, or if the item didn't fit into any of the children, we add it to the current quad
    this.items.push({ boundingRect, item });
  }

  items(result = []) {
    for (let { boundingRect: b, item: r } of this.items) {
      result.push(r);
    }

    for (let child of this.children) {
      if (child !== undefined) {
        child.items(result);
      }
    }

    return result;
  }

  search(boundingRect, result = []) {
    for (let { boundingRect: b, item: r } of this.items) {
      checked.push(r);
      if (boundingRect.overlaps(b)) {
        result.push(r);
      }
    }

    for (let i = 0; i < 4; ++i) {
      if (this.children[i] !== undefined) {
        if (boundingRect.contains(this.childRects[i])) {
          this.children[i].items(result);
        } else if (this.childRects[i].overlaps(boundingRect)) {
          this.children[i].search(boundingRect, result);
        }
      }
    }

    return result;
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

const rectangles = [];

let selected;
let candidates = [];
let colliding = [];
let checked = [];

const seed = 1337 ^ 0xdeadbeef;
const rand = sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed);

for (let i = 0; i < count; ++i) {
  const cx = Math.floor(rand() * canvasWidth);
  const cy = Math.floor(rand() * canvasHeight);
  const width = normal();
  const height = normal();

  rectangles.push(
    new Rectangle(cx - width / 2, cy - height / 2, width, height),
  );
}

const root = new QuadTree(new Rectangle(0, 0, canvasWidth, canvasHeight));
for (let rect of rectangles) {
  root.insert(rect, getBoundingRect(rect));
}

// draw

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 1;

  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw quads
  ctx.setLineDash([]);
  ctx.strokeStyle = WHITE;
  traverse(root, (node) => {
    ctx.strokeRect(
      node.rect.xlow,
      node.rect.ylow,
      node.rect.width,
      node.rect.height,
    );
  });

  // draw rects
  ctx.globalAlpha = 0.2;
  for (let rect of rectangles) {
    ctx.fillStyle = BLUE;

    if (rect === selected) {
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(rect.cx, rect.cy, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (colliding.includes(rect)) {
      ctx.fillStyle = GREEN;
    } else if (candidates.includes(rect)) {
      ctx.fillStyle = YELLOW;
    } else if (checked.includes(rect)) {
      ctx.fillStyle = RED;
    }

    ctx.globalAlpha = 0.2;
    ctx.fillRect(rect.xlow, rect.ylow, rect.width, rect.height);

    if (rect.width <= diameter || rect.height <= diameter) {
      ctx.globalAlpha = 1;
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = YELLOW;

      const boundingRect = getBoundingRect(rect);
      ctx.strokeRect(
        boundingRect.xlow,
        boundingRect.ylow,
        boundingRect.width,
        boundingRect.height,
      );
    }
  }
}

// handlers

canvas.onclick = (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  selected = null;
  checked = [];
  colliding = [];
  candidates = [];

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

  if (selected !== null) {
    const start = performance.now();

    candidates = root.search(getBoundingRect(selected));

    for (let cand of candidates) {
      if (cand !== selected) {
        const distX = Math.abs(selected.cx - cand.cx);
        const distY = Math.abs(selected.cy - cand.cy);

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
          colliding.push(cand);
        }
      }
    }

    const elapsed = performance.now() - start;
    document.getElementById("message").innerHTML =
      `<p>Checked ${checked.length} <span style="color: ${RED}">rectangles</span>` +
      ` and found ${candidates.length - 1} <span style="color: ${YELLOW}">candidate(s)</span>` +
      ` of which ${colliding.length} were true <span style="color: ${GREEN}">collisions</span>,` +
      ` in ${elapsed.toFixed(2)} ms</p>`;
    // selected rectangle is also in the overlapping list
  }
  draw();
};

// helpers

function traverse(node, callback) {
  callback(node);

  for (let child of node.children) {
    if (child !== undefined) {
      traverse(child, callback);
    }
  }
}

function getBoundingRect(rect) {
  const width = Math.max(rect.width, diameter);
  const height = Math.max(rect.height, diameter);
  return new Rectangle(
    rect.xlow + (rect.width - width) / 2,
    rect.ylow + (rect.height - height) / 2,
    width,
    height,
  );
}

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
