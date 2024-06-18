class Rectangle {
  constructor(rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }

  get right() {
    return this.x + this.width;
  }

  get bottom() {
    return this.y + this.height;
  }

  get cx() {
    return this.x + this.width / 2;
  }

  get cy() {
    return this.y + this.height / 2;
  }

  contains(rect) {
    if (rect.x < this.x) return false;
    if (rect.right >= this.right) return false;
    if (rect.y < this.y) return false;
    if (rect.bottom >= this.bottom) return false;
    return true;
  }

  overlaps(rect) {
    if (rect.right < this.x) return false;
    if (rect.x > this.right) return false;
    if (rect.bottom < this.y) return false;
    if (rect.y > this.bottom) return false;
    return true;
  }
}
