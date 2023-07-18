import Board from "./gameBoard";

export default class Player {

  init (opp) {
    this.opponent = opp
    this.board = new Board();
  }

  makeAttack ([y,x]) {
    if(x < 0 || x > this.board.board[0].length) throw new Error ('x coordinate overflow', x)
    if(y < 0 || y > this.board.board[0].length) throw new Error ('y coordinate overflow', y)
    return this.opponent.board.receiveAttack([y,x])
  }

}