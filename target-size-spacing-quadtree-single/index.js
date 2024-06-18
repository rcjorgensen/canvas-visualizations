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
  constructor(boundary, depth = 0) {
    this.boundary = boundary;
    this.depth = depth;
    this.items = [];
    this.divided = false;
    this.children = [];
  }

  subdivide() {
    const xlow = this.boundary.xlow;
    const ylow = this.boundary.ylow;
    const width = this.boundary.width / 2;
    const height = this.boundary.height / 2;
    const depth = this.depth + 1;

    this.children.push(
      new QuadTree(new Rectangle(xlow, ylow, width, height), depth),
    );
    this.children.push(
      new QuadTree(new Rectangle(xlow + width, ylow, width, height), depth),
    );
    this.children.push(
      new QuadTree(new Rectangle(xlow, ylow + height, width, height), depth),
    );
    this.children.push(
      new QuadTree(
        new Rectangle(xlow + width, ylow + height, width, height),
        depth,
      ),
    );

    this.divided = true;
  }

  insert(rectPair) {
    // If the item's bounding rectangle doesn't overlap this quad, don't insert
    if (!this.boundary.overlaps(rectPair.outer)) {
      return;
    }

    // If the max depth has been reached, insert
    if (this.depth >= maxDepth) {
      this.items.push(rectPair);
      return;
    }

    if (this.divided) {
      // This is not a leaf, insert into children
      for (let child of this.children) {
        child.insert(rectPair);
      }

      return;
    }

    // This is a leaf and we haven't reach max depth yet
    // If there is room, insert
    if (this.items.length < capacity) {
      this.items.push(rectPair);
      return;
    }

    // Otherwise, subdivide and insert the item as well as all items from this node into the children
    this.subdivide();

    for (let child of this.children) {
      for (let old of this.items) {
        child.insert(old);
      }
      child.insert(rectPair);
    }

    // Clear items in this node as it is no longer a leaf
    this.items = [];
  }

  /**
   * Returns all inner rectangles in a node and all descendant nodes
   */
  allItems(result = []) {
    for (let rectPair of this.items.filter((x) => !result.includes(x.inner))) {
      result.push(rectPair.inner);
    }

    for (let child of this.children) {
      child.allItems(result);
    }

    return result;
  }

  search(range, result = []) {
    // If this nodes doesn't overlap with the range, don't search this node
    if (!range.overlaps(this.boundary)) {
      return result;
    }

    // If this node is fully contained in the range, just insert everything
    if (range.contains(this.boundary)) {
      return this.allItems(result);
    }

    // Check all items in this node, that hasn't already been checked.
    // If this is not a leaf, there is nothing to check
    for (let rectPair of this.items.filter(
      (x) => !checked.includes(x.inner) && !result.includes(x.inner),
    )) {
      checked.push(rectPair.inner);
      if (range.overlaps(rectPair.outer)) {
        result.push(rectPair.inner);
      }
    }

    // Search all children
    for (let child of this.children) {
      child.search(range, result);
    }

    return result;
  }
}

// setup state

const params = new URL(document.location).searchParams;
const count = parseInt(params.get("count") ?? 400);
const maxDepth = parseInt(params.get("maxDepth") ?? 8);
const capacity = parseInt(params.get("capacity") ?? 4);
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
  root.insert({ inner: rect, outer: getBoundingRect(rect) });
}

// draw

const canvas = document.getElementById("my-canvas");
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
      node.boundary.xlow,
      node.boundary.ylow,
      node.boundary.width,
      node.boundary.height,
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
      `<p>Checked ${checked.length - 1} <span style="color: ${RED}">rectangles</span>` +
      ` and found ${candidates.length - 1} <span style="color: ${YELLOW}">candidate(s)</span>` +
      ` of which ${colliding.length} were true <span style="color: ${GREEN}">collisions</span>,` +
      ` in ${elapsed.toFixed(2)} ms</p>`;
    // selected rectangle is also in the overlapping list
  } else {
    document.getElementById("message").innerHTML =
      "<p>Click on a rectangle to check for collision</p>";
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
