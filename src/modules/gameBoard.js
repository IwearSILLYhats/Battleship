import Ship from "./shipBuilder";

// takes starting coordinate and length of ship to generate spaces a ship will occupy
function generateCoords ([lat, lon], length, yx) {
  if(length < 1) return false

  const axis = (yx === 'x') ? lon : lat
  if (axis + length > 9) throw new Error ('Coordinates must all fall within board', axis+length)

  const coords = []

  for (let i=0; i<length; i += 1){
    if (yx === 'x') coords.push([lat, lon+i])
    else coords.push([lat+i, lon])
  }
  return coords
}

// creates an x by x array grid equal to size and returns it
function initBoard(size) {
  // Board key:
  // Empty/Default Square = "D"
  // Square with ship = Ship array index of ship (0-4)
  // Attacked empty square = "M" for miss
  // Attacked square with ship = "H" for hit
  // Square with sunk ship = "S" for sunk

  const board = [];
  for (let i = 0; i < size; i+=1) {
      board.push(Array(size).fill("D"));
  }
  return board
}

export default class Board {

  constructor(size = 10) {
    this.board = initBoard(size)
    this.ships = []
  }

  // compares coordinates to matching spaces on board for existing ship placement
  compareShips (coords) {
    return coords.some(([lat,lon]) => this.board[lat][lon] !== "D")
  }

  gameOver () {
    if(this.ships.every(ship => ship.isSunk())){
      //  do some cool stuff, I guess
    }
  }

  //  accepts board coordinates (coord), length, and ship orientation (xy), rejects placement if ship already exists with those coordinates
  placeShip([lat, lon], len, yx) {

    if(len < 1) return false

    const coords = generateCoords([lat, lon], len, yx)


    if (this.compareShips(coords)) throw new Error(`ship already at these coordinates, ${[coords]}`)
    this.ships.push(new Ship(len, coords))
    coords.forEach(([c1,c2]) => {
      this.board[c1][c2] = this.ships.length-1
    })

    return coords
  }


  receiveAttack ([y,x]) {
    const target = this.board[y][x]
    let status;
    if(target === 'M' || target === 'H' || target === 'S') {
      throw new Error(`coordinate already marked, ${[y,x]}`)
    }
    if (target === "D") {
      this.board[y][x] = "M" 
      status = "M"
    }
    else if (Number.isInteger(target)) {
      this.ships[target].isHit()
      status = "H"
      if (this.ships[target].isSunk()) {
        this.gameOver()
        status = "S"
      }
    }
    return {status, loc:[y,x]}
  }
}