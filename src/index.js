import Player from "./modules/player";
import Ai from "./modules/aiPlayer";

export default function startGame () {
    const player1 = new Player()
    const aiPlayer = new Ai()
    player1.init(aiPlayer)
    aiPlayer.init(player1)
    return {player1, aiPlayer}
}