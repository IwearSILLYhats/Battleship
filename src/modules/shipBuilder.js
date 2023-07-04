export default class Ship {
  // functionality for individual ships

  constructor(len, coords) {
    this.length = len;
    this.hits = 0;
    this.sunk = false;
    this.location = coords;
  }

  hit() {
    this.hits += 1;
    return this.hits;
  }

  isSunk() {
    if (this.hits >= this.length) {
      this.sunk = true;
    }
    return this.sunk;
  }
}
