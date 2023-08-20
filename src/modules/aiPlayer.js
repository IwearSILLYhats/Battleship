import Player from "./player";

export function adjacentSquares ([y,x]) {
    let list = [[0,1],[1,0],[0,-1],[-1,0]]
    list = list.map(([a,b]) => [a+y,b+x])
    return list
  }
function randomNum (len) {
    return Math.floor(Math.random()*len)
  }
  
function randomCoord () {
    return [randomNum(10), randomNum(10)]
  }

export default class Ai extends Player {
    placeShip (len) {
        const yx = (randomNum(2)) ? 'y' : 'x'
        const coord = randomCoord()
        const ship = this.board.placeShip(coord, len, yx)
        if (!ship) return this.placeShip(len)
        return ship
      }

  // picks a random square on the board and then scrolls up or down until it lands on a valid (not hit/miss/sunk) square, then makes an attack
  makeAttack () {
    let [rndmy, rndmx] = randomCoord();
    const rndmScroll = (randomNum(2)) ? 1 : -1
    let atk = super.makeAttack([rndmy,rndmx])

    while (atk.status === "error") {
      if(rndmx <= 0) {
        rndmx = 9
        rndmy -= 1
        if(rndmy < 0) rndmy = 9
      }
      else if (rndmx >= 9) {
        rndmx = 0
        rndmy += 1
        if(rndmy > 9) rndmy = 0
      }
      else {
        rndmx += rndmScroll
      }
      atk = super.makeAttack([rndmy, rndmx])
    }
    return atk
  }

  startTurn() {
    this.makeAttack()
  }
}
