import Ship from "./modules/shipBuilder";
import Board from "./modules/gameBoard";
import Player from "./modules/player";

function startGame () {
    const player1 = new Player()
    const aiPlayer = new Player()
    player1.init(aiPlayer)
    aiPlayer.init(player1)
}