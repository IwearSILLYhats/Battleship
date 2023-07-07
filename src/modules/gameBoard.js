import Ship from "./shipBuilder";
import compareCoord from "./compare";

export default class Board {
  // functionality for board state

  constructor(size = 10) {
    this.board = this.initBoard(size)
    this.ships = []
  }

  // checks matches between generated coordinates from 'placeShip' and existing list of coordinates from this.ships
  compareShips (coord) {
    const match = this.ships.some(ship => ship.location.some(loc => compareCoord(coord, loc)))
    return match
  }

  gameOver () {
    if(this.ships.every(ship => ship.isSunk())){
      //  do some cool stuff, I guess
    }
  }
  
  // eslint-disable-next-line class-methods-use-this
  initBoard(size) {
    const board = [];
    for (let i = 0; i < size; i+=1) {
        board.push(Array(size).fill(0));
    }
    return board
  }

  //  accepts board coordinates (coord), length, and ship orientation (xy), rejects placement if ship already exists with those coordinates
  placeShip([lat, lon], length, yx) {

    if(length < 1) return false

    const axis = (yx === 'x') ? lon : lat
    if (axis + length > 9) return false

    const coords = []

    for (let i=0; i<length; i += 1){
      let temp;
      if (yx === 'x') temp = [lat, lon+i]
      else temp = [lat+i, lon]
      if (this.compareShips(temp)) throw new Error(`ship already at these coordinates, ${[coords]}`)
      coords.push(temp)
    }
    this.ships.push(new Ship(length, coords))
    return coords
  }


  receiveAttack ([y,x]) {
    if(this.board[y][x] === 1) {
      throw new Error(`coordinate already marked, ${[y,x]}`)
    }
    this.board[y][x] = 1

    const match = this.ships.find(ship => 
      ship.location.some(coord => 
        compareCoord([y,x], coord)
      )
    ) ?? false
    if (match){
      match.isHit()
      if (match.isSunk()){
        this.gameOver()
      }
    }

    return match
}

}
