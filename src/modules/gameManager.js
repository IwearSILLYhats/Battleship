import Player from "./player";
import Ai from "./aiPlayer";
import {renderAttack, generateUiShips, renderBoard} from "./domManager"

function getIndex (element) {
    return [...element.parentNode.children].indexOf(element)
}

export default class Game {
    constructor(){
        this.aiPlayer = new Ai()
        this.player1 = new Ai()
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
        this.placeRoster()
        this.rosterListener()
        this.boardListeners()
        this.placingShips = true
        
    }
    
    takeTurn () {
        let hidden = true
        if (this.currentPlayer === this.player1) hidden = false
        const atk = this.currentPlayer.makeAttack([2,2])
        renderAttack(atk, this.currentPlayer.opponent.dom, hidden)
        this.currentPlayer = this.currentPlayer.opponent
    }
    
    placeRoster () {
        generateUiShips(this.shipList)
    }

    demoShipPlacement () {
        const shipCoords = [[0,0], [0,2], [0,4], [0,6], [0,8]]
        shipCoords.forEach((coord, indx) => {
            this.player1.placeShip(this.shipList[indx])
        })
        shipCoords.forEach((coord, indx) => {
            this.aiPlayer.board.placeShip(coord, this.shipList[indx], "y")
        })
    }
    
    boardListeners () {
        const boards = document.querySelectorAll('.board')
        boards[0].addEventListener('click', (e) => {
            if (this.placingShips === false && e.target.closest('.cell')){
                const atkCoords = [ getIndex(e.target.parentNode), getIndex(e.target)]
                this.currentPlayer.makeAttack(atkCoords)
            }
        })

        boards[1].addEventListener('click', (e) => {
            if (this.placingShips === true && e.target.closest('.cell')) {
                const shipCoords = [ getIndex(e.target.parentNode), getIndex(e.target)]
                const attemptPlacement = this.player1.board.placeShip(shipCoords, this.selectedShip.childElementCount, this.axis)

                if(attemptPlacement) {
                    this.selectedShip.remove()
                    this.selectedShip = null
                    renderBoard(this.player1.board.board, this.player1.dom, false)
                }
            }
        })
    }

    rosterListener () {
        const roster = document.querySelector('.roster')
        roster.addEventListener('click', (e) => {
            roster.querySelectorAll('.ship').forEach((ship) => {
                ship.classList.remove('selected')
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
}