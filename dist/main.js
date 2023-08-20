/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/modules/aiPlayer.js":
/*!*********************************!*\
  !*** ./src/modules/aiPlayer.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   adjacentSquares: () => (/* binding */ adjacentSquares),
/* harmony export */   "default": () => (/* binding */ Ai)
/* harmony export */ });
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player */ "./src/modules/player.js");

function adjacentSquares([y, x]) {
  let list = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  list = list.map(([a, b]) => [a + y, b + x]);
  return list;
}
function randomNum(len) {
  return Math.floor(Math.random() * len);
}
function randomCoord() {
  return [randomNum(10), randomNum(10)];
}
class Ai extends _player__WEBPACK_IMPORTED_MODULE_0__["default"] {
  placeShip(len) {
    const yx = randomNum(2) ? 'y' : 'x';
    const coord = randomCoord();
    const ship = this.board.placeShip(coord, len, yx);
    if (!ship) return this.placeShip(len);
    return ship;
  }

  // picks a random square on the board and then scrolls up or down until it lands on a valid (not hit/miss/sunk) square, then makes an attack
  makeAttack() {
    let [rndmy, rndmx] = randomCoord();
    const rndmScroll = randomNum(2) ? 1 : -1;
    let atk = super.makeAttack([rndmy, rndmx]);
    while (atk.status === "error") {
      if (rndmx <= 0) {
        rndmx = 9;
        rndmy -= 1;
        if (rndmy < 0) rndmy = 9;
      } else if (rndmx >= 9) {
        rndmx = 0;
        rndmy += 1;
        if (rndmy > 9) rndmy = 0;
      } else {
        rndmx += rndmScroll;
      }
      atk = super.makeAttack([rndmy, rndmx]);
    }
    return atk;
  }
  startTurn() {
    this.makeAttack();
  }
}

/***/ }),

/***/ "./src/modules/domManager.js":
/*!***********************************!*\
  !*** ./src/modules/domManager.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearBoard: () => (/* binding */ clearBoard),
/* harmony export */   findTarget: () => (/* binding */ findTarget),
/* harmony export */   generateBoard: () => (/* binding */ generateBoard),
/* harmony export */   generateUiShips: () => (/* binding */ generateUiShips),
/* harmony export */   markSquare: () => (/* binding */ markSquare),
/* harmony export */   renderAttack: () => (/* binding */ renderAttack),
/* harmony export */   renderBoard: () => (/* binding */ renderBoard)
/* harmony export */ });
const gameArea = document.querySelector('.gameArea');
const roster = document.querySelector('.roster');
function clearBoard() {
  while (gameArea.firstChild) {
    gameArea.firstChild.remove();
  }
}
function generateBoard() {
  const board = document.createElement('div');
  board.classList.add('board');
  for (let i = 0; i < 10; i += 1) {
    const row = document.createElement('div');
    row.classList.add('row');
    board.appendChild(row);
    for (let j = 0; j < 10; j += 1) {
      const square = document.createElement('div');
      square.classList.add('cell');
      row.appendChild(square);
    }
  }
  gameArea.appendChild(board);
  return board;
}
function markSquare(boardState, targ, hideShips = true) {
  if (boardState === 'M') {
    targ.style.backgroundColor = 'green';
  } else if (boardState === "H") {
    targ.style.backgroundColor = "red";
  } else if (boardState === "S") {
    targ.style.backgroundColor = "grey";
  } else if (Number.isInteger(boardState) && hideShips === false) {
    targ.style.backgroundColor = "black";
  }
}
function renderBoard(boardState, dom, hideShips = true) {
  const rows = [...dom.querySelectorAll('.row')];
  for (let i = 0; i < 10; i += 1) {
    const curRow = rows[i];
    const curCell = [...curRow.querySelectorAll('.cell')];
    for (let j = 0; j < 10; j += 1) {
      markSquare(boardState[i][j], curCell[j], hideShips);
    }
  }
}
function findTarget([yCoord, xCoord], dom) {
  const row = [...dom.querySelectorAll('.row')][yCoord];
  const targ = [...row.querySelectorAll('.cell')][xCoord];
  return targ;
}
function renderAttack(atk, dom, hidden = true) {
  const aim = findTarget(atk.loc, dom);
  markSquare(atk.status, aim, hidden);
}
function generateUiShips(shipList) {
  shipList.forEach(ship => {
    const container = document.createElement('div');
    container.classList.add('ship');
    for (let i = 0; i < ship; i += 1) {
      const segment = document.createElement('div');
      segment.classList.add('segment');
      container.appendChild(segment);
    }
    roster.appendChild(container);
  });
}

/***/ }),

/***/ "./src/modules/gameBoard.js":
/*!**********************************!*\
  !*** ./src/modules/gameBoard.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Board)
/* harmony export */ });
/* harmony import */ var _shipBuilder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shipBuilder */ "./src/modules/shipBuilder.js");


// takes starting coordinate and length of ship to generate spaces a ship will occupy
function generateCoords([lat, lon], length, yx) {
  if (length < 1) return false;
  const axis = yx === 'x' ? lon : lat;
  if (axis + length > 9) return false;
  const coords = [];
  for (let i = 0; i < length; i += 1) {
    if (yx === 'x') coords.push([lat, lon + i]);else coords.push([lat + i, lon]);
  }
  return coords;
}

// creates an x by x array grid equal to size and returns it
function initBoard(size = 10) {
  // Board key:
  // Empty/Default Square = "D"
  // Square with ship = Ship array index of ship (0-4)
  // Attacked empty square = "M" for miss
  // Attacked square with ship = "H" for hit
  // Square with sunk ship = "S" for sunk

  const board = [];
  for (let i = 0; i < size; i += 1) {
    board.push(Array(size).fill("D"));
  }
  return board;
}
class Board {
  constructor(size) {
    this.board = initBoard(size);
    this.ships = [];
  }

  // compares coordinates to matching spaces on board for existing ship placement
  compareShips(coords) {
    return coords.some(([lat, lon]) => this.board[lat][lon] !== "D");
  }
  gameOver() {
    if (this.ships.every(ship => ship.isSunk())) {
      //  do some cool stuff, I guess
    }
  }

  //  accepts board coordinates (coord), length, and ship orientation (xy), rejects placement if ship already exists with those coordinates
  placeShip([lat, lon], len, yx) {
    try {
      if (len < 1) return false;
      const coords = generateCoords([lat, lon], len, yx);
      if (coords === false) throw new Error('Coordinates must all fall within board');
      if (this.compareShips(coords)) throw new Error(`ship already at these coordinates, ${[coords]}`);
      this.ships.push(new _shipBuilder__WEBPACK_IMPORTED_MODULE_0__["default"](len, coords));
      coords.forEach(([c1, c2]) => {
        this.board[c1][c2] = this.ships.length - 1;
      });
      return coords;
    } catch (error) {
      uiError(error);
      return false;
    }
  }
  receiveAttack([y, x]) {
    const atk = {
      status: "error",
      loc: [y, x],
      ship: null
    };
    const target = this.board[y][x];
    if (target === "D") {
      this.board[y][x] = "M";
      atk.status = "M";
    } else if (Number.isInteger(target)) {
      this.ships[target].isHit();
      atk.status = "H";
      atk.ship = this.ships[target];
    }
    return atk;
  }
}
function uiError(error) {
  const errorBox = document.querySelector('.info');
  errorBox.textContent = error;
}

/***/ }),

/***/ "./src/modules/gameManager.js":
/*!************************************!*\
  !*** ./src/modules/gameManager.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player */ "./src/modules/player.js");
/* harmony import */ var _aiPlayer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./aiPlayer */ "./src/modules/aiPlayer.js");
/* harmony import */ var _domManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./domManager */ "./src/modules/domManager.js");



class Game {
  constructor() {
    this.aiPlayer = new _aiPlayer__WEBPACK_IMPORTED_MODULE_1__["default"]();
    this.player1 = new _aiPlayer__WEBPACK_IMPORTED_MODULE_1__["default"]();
    this.aiPlayer.init(this.player1);
    this.player1.init(this.aiPlayer);
    this.currentPlayer = this.player1;
    this.shipList = [5, 4, 3, 3, 2];
    this.placingShips = null;
    this.selectedShip = null;
    this.startGame();
  }
  startGame() {
    (0,_domManager__WEBPACK_IMPORTED_MODULE_2__.renderBoard)(this.player1.board.board, this.player1.dom, true);
    this.placeRoster();
    this.placingShips = true;
  }
  takeTurn() {
    let hidden = true;
    if (this.currentPlayer === this.player1) hidden = false;
    const atk = this.currentPlayer.makeAttack([2, 2]);
    (0,_domManager__WEBPACK_IMPORTED_MODULE_2__.renderAttack)(atk, this.currentPlayer.opponent.dom, hidden);
    this.currentPlayer = this.currentPlayer.opponent;
  }
  placeRoster() {
    (0,_domManager__WEBPACK_IMPORTED_MODULE_2__.generateUiShips)(this.shipList);
  }
  demoShipPlacement() {
    const shipCoords = [[0, 0], [0, 2], [0, 4], [0, 6], [0, 8]];
    shipCoords.forEach((coord, indx) => {
      this.player1.placeShip(this.shipList[indx]);
    });
    shipCoords.forEach((coord, indx) => {
      this.aiPlayer.board.placeShip(coord, this.shipList[indx], "y");
    });
  }
  rosterListener() {
    const roster = document.querySelector('.roster');
    roster.addEventListener('click', e => {
      [roster.querySelectorAll('.ship')].forEach(ship => {
        ship.classList.remove('selected');
      });
      if (e.currentTarget.closest('.ship')) {
        const closest = e.currentTarget.closest('.ship');
        this.selectedShip = closest;
        closest.classList.add('selected');
      }
    });
  }
}

/***/ }),

/***/ "./src/modules/player.js":
/*!*******************************!*\
  !*** ./src/modules/player.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Player)
/* harmony export */ });
/* harmony import */ var _gameBoard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameBoard */ "./src/modules/gameBoard.js");
/* harmony import */ var _domManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./domManager */ "./src/modules/domManager.js");


class Player {
  init(opp) {
    this.opponent = opp;
    this.board = new _gameBoard__WEBPACK_IMPORTED_MODULE_0__["default"]();
    this.dom = (0,_domManager__WEBPACK_IMPORTED_MODULE_1__.generateBoard)();
  }
  makeAttack([y, x]) {
    try {
      if (x < 0 || x > this.board.board[0].length) throw new Error('x coordinate overflow', x);
      if (y < 0 || y > this.board.board[0].length) throw new Error('y coordinate overflow', y);
      return this.opponent.board.receiveAttack([y, x]);
    } catch (error) {
      return false;
    }
  }
}

/***/ }),

/***/ "./src/modules/shipBuilder.js":
/*!************************************!*\
  !*** ./src/modules/shipBuilder.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Ship)
/* harmony export */ });
class Ship {
  // functionality for individual ships

  constructor(len, coords) {
    this.length = len;
    this.hits = 0;
    this.sunk = false;
    this.location = coords;
  }
  isHit() {
    this.hits += 1;
    if (this.hits >= this.length) {
      this.sunk = true;
    }
    return this.hits;
  }
  isSunk() {
    return this.sunk;
  }
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_gameManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/gameManager */ "./src/modules/gameManager.js");

const game = new _modules_gameManager__WEBPACK_IMPORTED_MODULE_0__["default"]();
game.startGame();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTnlDO0FBRXpDLE1BQU1FLElBQUksR0FBRyxJQUFJdkIsNERBQUksQ0FBQyxDQUFDO0FBQ3ZCdUIsSUFBSSxDQUFDaEIsU0FBUyxDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2R1bGVzL2FpUGxheWVyLmpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2R1bGVzL2RvbU1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0Ly4vc3JjL21vZHVsZXMvZ2FtZUJvYXJkLmpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2R1bGVzL2dhbWVNYW5hZ2VyLmpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2R1bGVzL3BsYXllci5qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kdWxlcy9zaGlwQnVpbGRlci5qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3Qvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3Qvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3Qvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBsYXllciBmcm9tIFwiLi9wbGF5ZXJcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGFkamFjZW50U3F1YXJlcyAoW3kseF0pIHtcbiAgICBsZXQgbGlzdCA9IFtbMCwxXSxbMSwwXSxbMCwtMV0sWy0xLDBdXVxuICAgIGxpc3QgPSBsaXN0Lm1hcCgoW2EsYl0pID0+IFthK3ksYit4XSlcbiAgICByZXR1cm4gbGlzdFxuICB9XG5mdW5jdGlvbiByYW5kb21OdW0gKGxlbikge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqbGVuKVxuICB9XG4gIFxuZnVuY3Rpb24gcmFuZG9tQ29vcmQgKCkge1xuICAgIHJldHVybiBbcmFuZG9tTnVtKDEwKSwgcmFuZG9tTnVtKDEwKV1cbiAgfVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBaSBleHRlbmRzIFBsYXllciB7XG4gICAgcGxhY2VTaGlwIChsZW4pIHtcbiAgICAgICAgY29uc3QgeXggPSAocmFuZG9tTnVtKDIpKSA/ICd5JyA6ICd4J1xuICAgICAgICBjb25zdCBjb29yZCA9IHJhbmRvbUNvb3JkKClcbiAgICAgICAgY29uc3Qgc2hpcCA9IHRoaXMuYm9hcmQucGxhY2VTaGlwKGNvb3JkLCBsZW4sIHl4KVxuICAgICAgICBpZiAoIXNoaXApIHJldHVybiB0aGlzLnBsYWNlU2hpcChsZW4pXG4gICAgICAgIHJldHVybiBzaGlwXG4gICAgICB9XG5cbiAgLy8gcGlja3MgYSByYW5kb20gc3F1YXJlIG9uIHRoZSBib2FyZCBhbmQgdGhlbiBzY3JvbGxzIHVwIG9yIGRvd24gdW50aWwgaXQgbGFuZHMgb24gYSB2YWxpZCAobm90IGhpdC9taXNzL3N1bmspIHNxdWFyZSwgdGhlbiBtYWtlcyBhbiBhdHRhY2tcbiAgbWFrZUF0dGFjayAoKSB7XG4gICAgbGV0IFtybmRteSwgcm5kbXhdID0gcmFuZG9tQ29vcmQoKTtcbiAgICBjb25zdCBybmRtU2Nyb2xsID0gKHJhbmRvbU51bSgyKSkgPyAxIDogLTFcbiAgICBsZXQgYXRrID0gc3VwZXIubWFrZUF0dGFjayhbcm5kbXkscm5kbXhdKVxuXG4gICAgd2hpbGUgKGF0ay5zdGF0dXMgPT09IFwiZXJyb3JcIikge1xuICAgICAgaWYocm5kbXggPD0gMCkge1xuICAgICAgICBybmRteCA9IDlcbiAgICAgICAgcm5kbXkgLT0gMVxuICAgICAgICBpZihybmRteSA8IDApIHJuZG15ID0gOVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAocm5kbXggPj0gOSkge1xuICAgICAgICBybmRteCA9IDBcbiAgICAgICAgcm5kbXkgKz0gMVxuICAgICAgICBpZihybmRteSA+IDkpIHJuZG15ID0gMFxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJuZG14ICs9IHJuZG1TY3JvbGxcbiAgICAgIH1cbiAgICAgIGF0ayA9IHN1cGVyLm1ha2VBdHRhY2soW3JuZG15LCBybmRteF0pXG4gICAgfVxuICAgIHJldHVybiBhdGtcbiAgfVxuXG4gIHN0YXJ0VHVybigpIHtcbiAgICB0aGlzLm1ha2VBdHRhY2soKVxuICB9XG59XG4iLCJjb25zdCBnYW1lQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5nYW1lQXJlYScpXG5jb25zdCByb3N0ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucm9zdGVyJylcblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyQm9hcmQgKCkge1xuICAgIHdoaWxlKGdhbWVBcmVhLmZpcnN0Q2hpbGQpe1xuICAgICAgICBnYW1lQXJlYS5maXJzdENoaWxkLnJlbW92ZSgpXG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQm9hcmQgKCkge1xuICAgIGNvbnN0IGJvYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBib2FyZC5jbGFzc0xpc3QuYWRkKCdib2FyZCcpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSs9MSl7XG4gICAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKCdyb3cnKVxuICAgICAgICBib2FyZC5hcHBlbmRDaGlsZChyb3cpXG5cbiAgICAgICAgZm9yKGxldCBqID0gMDsgaiA8IDEwOyBqKz0gMSkge1xuICAgICAgICAgICAgY29uc3Qgc3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgIHNxdWFyZS5jbGFzc0xpc3QuYWRkKCdjZWxsJylcbiAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChzcXVhcmUpXG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2FtZUFyZWEuYXBwZW5kQ2hpbGQoYm9hcmQpXG4gICAgcmV0dXJuIGJvYXJkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrU3F1YXJlIChib2FyZFN0YXRlLCB0YXJnLCBoaWRlU2hpcHMgPSB0cnVlKSB7XG4gICAgaWYgKGJvYXJkU3RhdGUgPT09ICdNJyl7XG4gICAgICAgIHRhcmcuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ2dyZWVuJ1xuICAgIH1cbiAgICBlbHNlIGlmIChib2FyZFN0YXRlID09PSBcIkhcIil7XG4gICAgICAgIHRhcmcuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJyZWRcIlxuICAgIH1cbiAgICBlbHNlIGlmIChib2FyZFN0YXRlID09PSBcIlNcIil7XG4gICAgICAgIHRhcmcuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmV5XCJcbiAgICB9XG4gICAgZWxzZSBpZiAoTnVtYmVyLmlzSW50ZWdlcihib2FyZFN0YXRlKSAmJiBoaWRlU2hpcHMgPT09IGZhbHNlKXtcbiAgICAgICAgdGFyZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsYWNrXCJcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJCb2FyZCAoYm9hcmRTdGF0ZSwgZG9tLCBoaWRlU2hpcHM9dHJ1ZSkge1xuICAgIGNvbnN0IHJvd3MgPSBbLi4uZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJy5yb3cnKV1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKz0xKXtcbiAgICAgICAgY29uc3QgY3VyUm93ID0gcm93c1tpXVxuICAgICAgICBjb25zdCBjdXJDZWxsID0gWy4uLmN1clJvdy5xdWVyeVNlbGVjdG9yQWxsKCcuY2VsbCcpXVxuICAgICAgICBmb3IobGV0IGogPSAwOyBqIDwgMTA7IGorPTEpe1xuICAgICAgICAgICAgbWFya1NxdWFyZShib2FyZFN0YXRlW2ldW2pdLCBjdXJDZWxsW2pdLCBoaWRlU2hpcHMpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kVGFyZ2V0IChbeUNvb3JkLCB4Q29vcmRdLCBkb20pIHtcbiAgICBjb25zdCByb3cgPSBbLi4uZG9tLnF1ZXJ5U2VsZWN0b3JBbGwoJy5yb3cnKV1beUNvb3JkXVxuICAgIGNvbnN0IHRhcmcgPSBbLi4ucm93LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jZWxsJyldW3hDb29yZF1cbiAgICByZXR1cm4gdGFyZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQXR0YWNrIChhdGssIGRvbSwgaGlkZGVuID0gdHJ1ZSkge1xuICAgIGNvbnN0IGFpbSA9IGZpbmRUYXJnZXQoYXRrLmxvYywgZG9tKVxuICAgIG1hcmtTcXVhcmUoYXRrLnN0YXR1cywgYWltLCBoaWRkZW4pXG59XG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVVaVNoaXBzIChzaGlwTGlzdCkge1xuICAgIHNoaXBMaXN0LmZvckVhY2goc2hpcCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzaGlwJylcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaGlwOyBpICs9IDEpe1xuICAgICAgICAgICAgY29uc3Qgc2VnbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgICBzZWdtZW50LmNsYXNzTGlzdC5hZGQoJ3NlZ21lbnQnKVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNlZ21lbnQpXG4gICAgICAgIH1cbiAgICAgICAgcm9zdGVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcilcbiAgICB9KVxufSIsImltcG9ydCBTaGlwIGZyb20gXCIuL3NoaXBCdWlsZGVyXCI7XG5cbi8vIHRha2VzIHN0YXJ0aW5nIGNvb3JkaW5hdGUgYW5kIGxlbmd0aCBvZiBzaGlwIHRvIGdlbmVyYXRlIHNwYWNlcyBhIHNoaXAgd2lsbCBvY2N1cHlcbmZ1bmN0aW9uIGdlbmVyYXRlQ29vcmRzIChbbGF0LCBsb25dLCBsZW5ndGgsIHl4KSB7XG4gICAgaWYobGVuZ3RoIDwgMSkgcmV0dXJuIGZhbHNlXG4gIFxuICAgIGNvbnN0IGF4aXMgPSAoeXggPT09ICd4JykgPyBsb24gOiBsYXRcbiAgICBpZiAoYXhpcyArIGxlbmd0aCA+IDkpIHJldHVybiBmYWxzZVxuICBcbiAgICBjb25zdCBjb29yZHMgPSBbXVxuICBcbiAgICBmb3IgKGxldCBpPTA7IGk8bGVuZ3RoOyBpICs9IDEpe1xuICAgICAgaWYgKHl4ID09PSAneCcpIGNvb3Jkcy5wdXNoKFtsYXQsIGxvbitpXSlcbiAgICAgIGVsc2UgY29vcmRzLnB1c2goW2xhdCtpLCBsb25dKVxuICAgIH1cbiAgICByZXR1cm4gY29vcmRzXG59XG5cbi8vIGNyZWF0ZXMgYW4geCBieSB4IGFycmF5IGdyaWQgZXF1YWwgdG8gc2l6ZSBhbmQgcmV0dXJucyBpdFxuZnVuY3Rpb24gaW5pdEJvYXJkKHNpemUgPSAxMCkge1xuICAvLyBCb2FyZCBrZXk6XG4gIC8vIEVtcHR5L0RlZmF1bHQgU3F1YXJlID0gXCJEXCJcbiAgLy8gU3F1YXJlIHdpdGggc2hpcCA9IFNoaXAgYXJyYXkgaW5kZXggb2Ygc2hpcCAoMC00KVxuICAvLyBBdHRhY2tlZCBlbXB0eSBzcXVhcmUgPSBcIk1cIiBmb3IgbWlzc1xuICAvLyBBdHRhY2tlZCBzcXVhcmUgd2l0aCBzaGlwID0gXCJIXCIgZm9yIGhpdFxuICAvLyBTcXVhcmUgd2l0aCBzdW5rIHNoaXAgPSBcIlNcIiBmb3Igc3Vua1xuXG4gIGNvbnN0IGJvYXJkID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSs9MSkge1xuICAgICAgYm9hcmQucHVzaChBcnJheShzaXplKS5maWxsKFwiRFwiKSk7XG4gIH1cbiAgcmV0dXJuIGJvYXJkXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvYXJkIHtcblxuICBjb25zdHJ1Y3RvcihzaXplKSB7XG4gICAgdGhpcy5ib2FyZCA9IGluaXRCb2FyZChzaXplKVxuICAgIHRoaXMuc2hpcHMgPSBbXVxuICB9XG5cbiAgLy8gY29tcGFyZXMgY29vcmRpbmF0ZXMgdG8gbWF0Y2hpbmcgc3BhY2VzIG9uIGJvYXJkIGZvciBleGlzdGluZyBzaGlwIHBsYWNlbWVudFxuICBjb21wYXJlU2hpcHMgKGNvb3Jkcykge1xuICAgIHJldHVybiBjb29yZHMuc29tZSgoW2xhdCxsb25dKSA9PiB0aGlzLmJvYXJkW2xhdF1bbG9uXSAhPT0gXCJEXCIpXG4gIH1cblxuICBnYW1lT3ZlciAoKSB7XG4gICAgaWYodGhpcy5zaGlwcy5ldmVyeShzaGlwID0+IHNoaXAuaXNTdW5rKCkpKXtcbiAgICAgIC8vICBkbyBzb21lIGNvb2wgc3R1ZmYsIEkgZ3Vlc3NcbiAgICB9XG4gIH1cblxuICAvLyAgYWNjZXB0cyBib2FyZCBjb29yZGluYXRlcyAoY29vcmQpLCBsZW5ndGgsIGFuZCBzaGlwIG9yaWVudGF0aW9uICh4eSksIHJlamVjdHMgcGxhY2VtZW50IGlmIHNoaXAgYWxyZWFkeSBleGlzdHMgd2l0aCB0aG9zZSBjb29yZGluYXRlc1xuICBwbGFjZVNoaXAoW2xhdCwgbG9uXSwgbGVuLCB5eCkge1xuICAgIHRyeXtcbiAgICAgIGlmKGxlbiA8IDEpIHJldHVybiBmYWxzZVxuICBcbiAgICAgIGNvbnN0IGNvb3JkcyA9IGdlbmVyYXRlQ29vcmRzKFtsYXQsIGxvbl0sIGxlbiwgeXgpXG4gICAgICBpZiAoY29vcmRzID09PSBmYWxzZSkgdGhyb3cgbmV3IEVycm9yICgnQ29vcmRpbmF0ZXMgbXVzdCBhbGwgZmFsbCB3aXRoaW4gYm9hcmQnKVxuICBcbiAgICAgIGlmICh0aGlzLmNvbXBhcmVTaGlwcyhjb29yZHMpKSB0aHJvdyBuZXcgRXJyb3IoYHNoaXAgYWxyZWFkeSBhdCB0aGVzZSBjb29yZGluYXRlcywgJHtbY29vcmRzXX1gKVxuICAgICAgdGhpcy5zaGlwcy5wdXNoKG5ldyBTaGlwKGxlbiwgY29vcmRzKSlcbiAgICAgIGNvb3Jkcy5mb3JFYWNoKChbYzEsYzJdKSA9PiB7XG4gICAgICAgIHRoaXMuYm9hcmRbYzFdW2MyXSA9IHRoaXMuc2hpcHMubGVuZ3RoLTFcbiAgICAgIH0pXG4gIFxuICAgICAgcmV0dXJuIGNvb3Jkc1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHVpRXJyb3IoZXJyb3IpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuXG4gIHJlY2VpdmVBdHRhY2sgKFt5LHhdKSB7XG4gICAgY29uc3QgYXRrID0ge3N0YXR1czogXCJlcnJvclwiLCBsb2M6IFt5LHhdLCBzaGlwOiBudWxsfVxuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuYm9hcmRbeV1beF1cblxuICAgIGlmICh0YXJnZXQgPT09IFwiRFwiKSB7XG4gICAgICB0aGlzLmJvYXJkW3ldW3hdID0gXCJNXCIgXG4gICAgICBhdGsuc3RhdHVzID0gXCJNXCJcbiAgICB9XG4gICAgZWxzZSBpZiAoTnVtYmVyLmlzSW50ZWdlcih0YXJnZXQpKSB7XG4gICAgICB0aGlzLnNoaXBzW3RhcmdldF0uaXNIaXQoKVxuICAgICAgYXRrLnN0YXR1cyA9IFwiSFwiXG4gICAgICBhdGsuc2hpcCA9IHRoaXMuc2hpcHNbdGFyZ2V0XVxuICAgIH1cbiAgICByZXR1cm4gYXRrXG4gIH1cbn1cblxuZnVuY3Rpb24gdWlFcnJvciAoZXJyb3IpIHtcbiAgY29uc3QgZXJyb3JCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW5mbycpXG4gIGVycm9yQm94LnRleHRDb250ZW50ID0gZXJyb3Jcbn0iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IEFpIGZyb20gXCIuL2FpUGxheWVyXCI7XG5pbXBvcnQge3JlbmRlckF0dGFjaywgZ2VuZXJhdGVVaVNoaXBzLCByZW5kZXJCb2FyZH0gZnJvbSBcIi4vZG9tTWFuYWdlclwiXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuYWlQbGF5ZXIgPSBuZXcgQWkoKVxuICAgICAgICB0aGlzLnBsYXllcjEgPSBuZXcgQWkoKVxuICAgICAgICB0aGlzLmFpUGxheWVyLmluaXQodGhpcy5wbGF5ZXIxKVxuICAgICAgICB0aGlzLnBsYXllcjEuaW5pdCh0aGlzLmFpUGxheWVyKVxuICAgICAgICB0aGlzLmN1cnJlbnRQbGF5ZXIgPSB0aGlzLnBsYXllcjFcbiAgICAgICAgdGhpcy5zaGlwTGlzdCA9IFs1LDQsMywzLDJdXG4gICAgICAgIHRoaXMucGxhY2luZ1NoaXBzID0gbnVsbFxuICAgICAgICB0aGlzLnNlbGVjdGVkU2hpcCA9IG51bGxcbiAgICAgICAgdGhpcy5zdGFydEdhbWUoKVxuICAgIH1cblxuICAgIHN0YXJ0R2FtZSgpe1xuICAgICAgICByZW5kZXJCb2FyZCh0aGlzLnBsYXllcjEuYm9hcmQuYm9hcmQsIHRoaXMucGxheWVyMS5kb20sIHRydWUpXG4gICAgICAgIHRoaXMucGxhY2VSb3N0ZXIoKVxuICAgICAgICB0aGlzLnBsYWNpbmdTaGlwcyA9IHRydWVcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHRha2VUdXJuICgpIHtcbiAgICAgICAgbGV0IGhpZGRlbiA9IHRydWVcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBsYXllciA9PT0gdGhpcy5wbGF5ZXIxKSBoaWRkZW4gPSBmYWxzZVxuICAgICAgICBjb25zdCBhdGsgPSB0aGlzLmN1cnJlbnRQbGF5ZXIubWFrZUF0dGFjayhbMiwyXSlcbiAgICAgICAgcmVuZGVyQXR0YWNrKGF0aywgdGhpcy5jdXJyZW50UGxheWVyLm9wcG9uZW50LmRvbSwgaGlkZGVuKVxuICAgICAgICB0aGlzLmN1cnJlbnRQbGF5ZXIgPSB0aGlzLmN1cnJlbnRQbGF5ZXIub3Bwb25lbnRcbiAgICB9XG4gICAgXG4gICAgcGxhY2VSb3N0ZXIgKCkge1xuICAgICAgICBnZW5lcmF0ZVVpU2hpcHModGhpcy5zaGlwTGlzdClcbiAgICB9XG5cbiAgICBkZW1vU2hpcFBsYWNlbWVudCAoKSB7XG4gICAgICAgIGNvbnN0IHNoaXBDb29yZHMgPSBbWzAsMF0sIFswLDJdLCBbMCw0XSwgWzAsNl0sIFswLDhdXVxuICAgICAgICBzaGlwQ29vcmRzLmZvckVhY2goKGNvb3JkLCBpbmR4KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXllcjEucGxhY2VTaGlwKHRoaXMuc2hpcExpc3RbaW5keF0pXG4gICAgICAgIH0pXG4gICAgICAgIHNoaXBDb29yZHMuZm9yRWFjaCgoY29vcmQsIGluZHgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWlQbGF5ZXIuYm9hcmQucGxhY2VTaGlwKGNvb3JkLCB0aGlzLnNoaXBMaXN0W2luZHhdLCBcInlcIilcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByb3N0ZXJMaXN0ZW5lciAoKSB7XG4gICAgICAgIGNvbnN0IHJvc3RlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yb3N0ZXInKVxuICAgICAgICByb3N0ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgW3Jvc3Rlci5xdWVyeVNlbGVjdG9yQWxsKCcuc2hpcCcpXS5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgICAgICAgICAgc2hpcC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldC5jbG9zZXN0KCcuc2hpcCcpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xvc2VzdCA9IGUuY3VycmVudFRhcmdldC5jbG9zZXN0KCcuc2hpcCcpXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFNoaXAgPSBjbG9zZXN0XG4gICAgICAgICAgICAgICAgY2xvc2VzdC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxufSIsImltcG9ydCBCb2FyZCBmcm9tIFwiLi9nYW1lQm9hcmRcIjtcbmltcG9ydCB7IGdlbmVyYXRlQm9hcmQgfSBmcm9tIFwiLi9kb21NYW5hZ2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG5cbiAgaW5pdCAob3BwKSB7XG4gICAgdGhpcy5vcHBvbmVudCA9IG9wcFxuICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKVxuICAgIHRoaXMuZG9tID0gZ2VuZXJhdGVCb2FyZCgpXG4gIH1cblxuICBtYWtlQXR0YWNrIChbeSx4XSkge1xuICAgIHRyeXtcbiAgICAgIGlmKHggPCAwIHx8IHggPiB0aGlzLmJvYXJkLmJvYXJkWzBdLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yICgneCBjb29yZGluYXRlIG92ZXJmbG93JywgeClcbiAgICAgIGlmKHkgPCAwIHx8IHkgPiB0aGlzLmJvYXJkLmJvYXJkWzBdLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yICgneSBjb29yZGluYXRlIG92ZXJmbG93JywgeSlcbiAgICAgIHJldHVybiB0aGlzLm9wcG9uZW50LmJvYXJkLnJlY2VpdmVBdHRhY2soW3kseF0pXG4gICAgfVxuICAgIGNhdGNoIChlcnJvcil7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTaGlwIHtcbiAgLy8gZnVuY3Rpb25hbGl0eSBmb3IgaW5kaXZpZHVhbCBzaGlwc1xuXG4gIGNvbnN0cnVjdG9yKGxlbiwgY29vcmRzKSB7XG4gICAgdGhpcy5sZW5ndGggPSBsZW47XG4gICAgdGhpcy5oaXRzID0gMDtcbiAgICB0aGlzLnN1bmsgPSBmYWxzZTtcbiAgICB0aGlzLmxvY2F0aW9uID0gY29vcmRzO1xuICB9XG5cbiAgaXNIaXQoKSB7XG4gICAgdGhpcy5oaXRzICs9IDE7XG4gICAgaWYgKHRoaXMuaGl0cyA+PSB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdW5rID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaGl0cztcbiAgfVxuXG4gIGlzU3VuaygpIHtcbiAgICByZXR1cm4gdGhpcy5zdW5rO1xuICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBHYW1lIGZyb20gXCIuL21vZHVsZXMvZ2FtZU1hbmFnZXJcIjtcblxuY29uc3QgZ2FtZSA9IG5ldyBHYW1lKClcbmdhbWUuc3RhcnRHYW1lKCkiXSwibmFtZXMiOlsiUGxheWVyIiwiYWRqYWNlbnRTcXVhcmVzIiwieSIsIngiLCJsaXN0IiwibWFwIiwiYSIsImIiLCJyYW5kb21OdW0iLCJsZW4iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJyYW5kb21Db29yZCIsIkFpIiwicGxhY2VTaGlwIiwieXgiLCJjb29yZCIsInNoaXAiLCJib2FyZCIsIm1ha2VBdHRhY2siLCJybmRteSIsInJuZG14Iiwicm5kbVNjcm9sbCIsImF0ayIsInN0YXR1cyIsInN0YXJ0VHVybiIsImdhbWVBcmVhIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicm9zdGVyIiwiY2xlYXJCb2FyZCIsImZpcnN0Q2hpbGQiLCJyZW1vdmUiLCJnZW5lcmF0ZUJvYXJkIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImkiLCJyb3ciLCJhcHBlbmRDaGlsZCIsImoiLCJzcXVhcmUiLCJtYXJrU3F1YXJlIiwiYm9hcmRTdGF0ZSIsInRhcmciLCJoaWRlU2hpcHMiLCJzdHlsZSIsImJhY2tncm91bmRDb2xvciIsIk51bWJlciIsImlzSW50ZWdlciIsInJlbmRlckJvYXJkIiwiZG9tIiwicm93cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJjdXJSb3ciLCJjdXJDZWxsIiwiZmluZFRhcmdldCIsInlDb29yZCIsInhDb29yZCIsInJlbmRlckF0dGFjayIsImhpZGRlbiIsImFpbSIsImxvYyIsImdlbmVyYXRlVWlTaGlwcyIsInNoaXBMaXN0IiwiZm9yRWFjaCIsImNvbnRhaW5lciIsInNlZ21lbnQiLCJTaGlwIiwiZ2VuZXJhdGVDb29yZHMiLCJsYXQiLCJsb24iLCJsZW5ndGgiLCJheGlzIiwiY29vcmRzIiwicHVzaCIsImluaXRCb2FyZCIsInNpemUiLCJBcnJheSIsImZpbGwiLCJCb2FyZCIsImNvbnN0cnVjdG9yIiwic2hpcHMiLCJjb21wYXJlU2hpcHMiLCJzb21lIiwiZ2FtZU92ZXIiLCJldmVyeSIsImlzU3VuayIsIkVycm9yIiwiYzEiLCJjMiIsImVycm9yIiwidWlFcnJvciIsInJlY2VpdmVBdHRhY2siLCJ0YXJnZXQiLCJpc0hpdCIsImVycm9yQm94IiwidGV4dENvbnRlbnQiLCJHYW1lIiwiYWlQbGF5ZXIiLCJwbGF5ZXIxIiwiaW5pdCIsImN1cnJlbnRQbGF5ZXIiLCJwbGFjaW5nU2hpcHMiLCJzZWxlY3RlZFNoaXAiLCJzdGFydEdhbWUiLCJwbGFjZVJvc3RlciIsInRha2VUdXJuIiwib3Bwb25lbnQiLCJkZW1vU2hpcFBsYWNlbWVudCIsInNoaXBDb29yZHMiLCJpbmR4Iiwicm9zdGVyTGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImN1cnJlbnRUYXJnZXQiLCJjbG9zZXN0Iiwib3BwIiwiaGl0cyIsInN1bmsiLCJsb2NhdGlvbiIsImdhbWUiXSwic291cmNlUm9vdCI6IiJ9