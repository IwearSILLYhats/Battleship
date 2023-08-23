const errorBox = document.querySelector('.info')
const gameArea = document.querySelector('.gameArea')
const roster = document.querySelector('.roster')

export function clearBoard () {
    while(gameArea.firstChild){
        gameArea.firstChild.remove()
    }
}

function resetError () {
    if(roster.firstChild) errorBox.textContent = "Please place your ships"
    else errorBox.textContent = "Please choose a square to attack"
  }

export function generateBoard () {
    const board = document.createElement('div')
    board.classList.add('board')
    for (let i = 0; i < 10; i+=1){
        const row = document.createElement('div')
        row.classList.add('row')
        board.appendChild(row)

        for(let j = 0; j < 10; j+= 1) {
            const square = document.createElement('div')
            square.classList.add('cell')
            row.appendChild(square)
        }
    }
    gameArea.appendChild(board)
    return board
}

export function markSquare (boardState, targ, hideShips = true) {
    if (boardState === 'M'){
        targ.style.backgroundColor = 'green'
    }
    else if (boardState === "H"){
        targ.style.backgroundColor = "red"
    }
    else if (boardState === "S"){
        targ.style.backgroundColor = "grey"
    }
    else if (Number.isInteger(boardState) && hideShips === false){
        targ.style.backgroundColor = "black"
    }
}

export function renderBoard (boardState, dom, hideShips=true) {
    const rows = [...dom.querySelectorAll('.row')]
    for (let i = 0; i < 10; i+=1){
        const curRow = rows[i]
        const curCell = [...curRow.querySelectorAll('.cell')]
        for(let j = 0; j < 10; j+=1){
            markSquare(boardState[i][j], curCell[j], hideShips)
        }
    }
}

export function findTarget ([yCoord, xCoord], dom) {
    const row = [...dom.querySelectorAll('.row')][yCoord]
    const targ = [...row.querySelectorAll('.cell')][xCoord]
    return targ
}

export function renderAttack (atk, dom, hidden = true) {
    const aim = findTarget(atk.loc, dom)
    markSquare(atk.status, aim, hidden)
}
export function generateUiShips (shipList) {
    shipList.forEach(ship => {
        const container = document.createElement('div')
        container.classList.add('ship')
        for (let i = 0; i < ship; i += 1){
            const segment = document.createElement('div')
            segment.classList.add('segment')
            container.appendChild(segment)
        }
        roster.appendChild(container)
    })
}

export function uiError (error) {
    errorBox.textContent = error
    setTimeout(resetError, 5000)
  }