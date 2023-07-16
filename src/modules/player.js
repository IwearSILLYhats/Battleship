import Board from "./gameBoard";

function randomNum (len) {
  return Math.floor(Math.random()*len)
}

function randomCoord () {
  return [randomNum(10), randomNum(10)]
}

export default class Player {

  adjacentSquares ([y,x]) {
    let list = [[0,1],[1,0],[0,-1],[-1,0]]
    list = list.map(([a,b]) => [a+y,b+x])
    return list
  }

  aiMakeAttack () {
    
  }

  aiPlaceShip (len) {
    const yx = (randomNum(2)) ? 'y' : 'x'
    const coord = randomCoord()
    const ship = this.board.placeShip(coord, len, yx)
    if (!ship) return this.aiPlaceShip(len)
    return ship
  }

  init (opp) {
    this.opponent = opp
    this.board = new Board();
  }

}

