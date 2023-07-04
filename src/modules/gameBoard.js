import Ship from "./shipBuilder";

export default class Board {
  // functionality for board state

  constructor(size = 10) {
    this.board = this.initBoard(size)
    this.ships = []
  }

  //  accepts board coordinates (coord), length, and ship orientation (xy)
  placeShip([lat, lon], length, yx) {

    if(length < 1) return false

    const axis = (yx === 'x') ? lon : lat
    if (axis + length > 9) return false

    const coords = []

    for (let i=0; i<length; i += 1){
      if (yx === 'x') coords.push([lat, lon+i])
      else coords.push([lat+i, lon])
    }
    this.ships.push(new Ship(length, coords))
    return coords
  }

  // eslint-disable-next-line class-methods-use-this
  initBoard(size) {
    const board = [];
    for (let i = 0; i < size; i+=1) {
        board.push(Array(size).fill(0));
    }
    return board
  }
}
