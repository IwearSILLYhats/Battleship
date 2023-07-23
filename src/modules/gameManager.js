import Player from "./player";
import Ai from "./aiPlayer";


export default class Game {
    constructor(){
        this.aiPlayer = new Ai()
        this.player1 = new Player()
        this.currentPlayer = this.player1
        this.aiPlayer.init(this.player1)
        this.player1.init(this.aiPlayer)
    }

    takeTurn () {
        this.currentPlayer = this.currentPlayer.opponent
    }
}