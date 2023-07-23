const gameArea = document.querySelector('.gameArea')


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
    const rows = [...dom.querySelector('.row')]
    for (let i = 0; i < 10; i+=1){
        const curRow = rows[i]
        const curCell = [...curRow.querySelector('cell')]
        for(let j = 0; j < 10; j+=1){
            markSquare(boardState, curCell[j], hideShips)
        }
    }
}

export function findTarget ([yCoord, xCoord], dom) {
    const row = [...dom.querySelector('.row')][yCoord]
    const targ = [...row.querySelector('.cell')][xCoord]
    return targ
}

