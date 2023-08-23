import Player from "./player";
import Ai from "./aiPlayer";
import {renderAttack, generateUiShips, renderBoard, uiError} from "./domManager"

function getIndex (element) {
    return [...element.parentNode.children].indexOf(element)
}

export default class Game {
    constructor(){
        this.aiPlayer = new Ai()
        this.player1 = new Player()
        this.aiPlayer.init(this.player1)
        this.player1.init(this.aiPlayer)
        this.currentPlayer = this.player1
        this.shipList = [5,4,3,3,2]
        this.placingShips = null
        this.selectedShip = null
        this.axis = 'x'
        this.startGame()
    }

    startGame(){
        renderBoard(this.player1.board.board, this.player1.dom, true)
        generateUiShips(this.shipList)
        this.rosterListener()
        this.boardListeners()
        this.aiShipPlacement ()
        renderBoard(this.aiPlayer.board.board, this.aiPlayer.dom, false)
        this.placingShips = true
        
    }

    aiShipPlacement () {
        this.shipList.forEach((coord) => {
            this.aiPlayer.placeShip(coord)
        })
    }
    
    boardListeners () {
        const boards = document.querySelectorAll('.board')
        boards[0].addEventListener('click', (e) => {
            if (this.placingShips === false && e.target.closest('.cell')) {
                const atkCoords = [getIndex(e.target.parentNode), getIndex(e.target)]
                const atk = this.player1.makeAttack(atkCoords)
                renderAttack(atk, this.player1.opponent.dom, true)
                if (atk.status !== "error") {
                    if (atk.status === "H") this.checkWinner()
                    if (this.placingShips !== null) {
                        const enemyAtk = this.aiPlayer.makeAttack()
                        renderAttack(enemyAtk, this.player1.dom, false)
                        console.log(enemyAtk)
                    }
                }
            }
        })

        boards[1].addEventListener('click', (e) => {
            if (this.placingShips === true && this.selectedShip != null && e.target.closest('.cell')) {
                const shipCoords = [ getIndex(e.target.parentNode), getIndex(e.target)]
                const attemptPlacement = this.player1.board.placeShip(shipCoords, this.selectedShip.childElementCount, this.axis)

                if(attemptPlacement) {
                    this.selectedShip.remove()
                    this.selectedShip = null
                    renderBoard(this.player1.board.board, this.player1.dom, false)
                    if(document.querySelectorAll('.ship').length === 0) {
                        this.placingShips = false
                    }
                }
            }
        })
    }

    rosterListener () {
        const roster = document.querySelector('.roster')
        roster.addEventListener('click', (e) => {
            roster.querySelectorAll('.ship').forEach((ship) => {
                ship.classList.remove('selected')
                this.selectedShip = null
            })
            if (e.target.closest('.ship')) {
                const closest = e.target.closest('.ship')
                closest.classList.add('selected')
                this.boundSelectedShip(closest)
            }
        })
        roster.addEventListener('dblclick', () => {
            this.axis = (this.axis === "x") ? "y" : "x"
            if (this.axis === "y"){
                roster.classList.add('vertical')
            }
            else {
                roster.classList.remove('vertical')
            }
        })
    }

    boundSelectedShip = this.selectedShip.bind(this)

    selectedShip(val) {
        this.selectedShip = val
    }
    
    checkWinner () {
        if (this.player1.opponent.board.ships.every((ship) => ship.isSunk())){
            uiError('Player1 Wins!')
            this.placingShips = null
        }
        else if (this.player1.board.ships.every((ship) => ship.isSunk())){
            uiError('AI Wins!')
            this.placingShips = null
        }
    }
}

