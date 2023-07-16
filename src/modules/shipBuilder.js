export default class Ship {
  // functionality for individual ships

  constructor(len, coords) {
    this.length = len;
    this.hits = 0;
    this.sunk = false;
    this.location = coords;
  }

  isHit() {
    this.hits += 1;
    if (this.hits >= this.length) {
      this.sunk = true;
    }
    return this.hits;
  }

  isSunk() {
    return this.sunk;
  }
}
