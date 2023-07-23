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
  aiPlaceShip(len) {
    const yx = randomNum(2) ? 'y' : 'x';
    const coord = randomCoord();
    const ship = this.board.placeShip(coord, len, yx);
    if (!ship) return this.aiPlaceShip(len);
    return ship;
  }

  // picks a random square on the board and then scrolls up or down until it lands on a valid (not hit/miss/sunk) square, then makes an attack
  aiMakeAttack() {
    let [rndmy, rndmx] = randomCoord();
    const rndmScroll = randomNum(2) ? 1 : -1;
    let atk = this.makeAttack([rndmy, rndmx]);
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
      atk = this.makeAttack([rndmy, rndmx]);
    }
    return atk;
  }
  startTurn() {
    this.aiMakeAttack();
    endTurn();
  }
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
  if (axis + length > 9) throw new Error('Coordinates must all fall within board', axis + length);
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
    if (len < 1) return false;
    const coords = generateCoords([lat, lon], len, yx);
    if (this.compareShips(coords)) throw new Error(`ship already at these coordinates, ${[coords]}`);
    this.ships.push(new _shipBuilder__WEBPACK_IMPORTED_MODULE_0__["default"](len, coords));
    coords.forEach(([c1, c2]) => {
      this.board[c1][c2] = this.ships.length - 1;
    });
    return coords;
  }
  receiveAttack([y, x]) {
    const target = this.board[y][x];
    let status;
    if (target === 'M' || target === 'H' || target === 'S') {
      status = "error";
      // throw new Error(`coordinate already marked, ${[y,x]}`)
    }

    if (target === "D") {
      this.board[y][x] = "M";
      status = "M";
    } else if (Number.isInteger(target)) {
      this.ships[target].isHit();
      status = "H";
      if (this.ships[target].isSunk()) {
        this.gameOver();
        status = "S";
      }
    }
    return {
      status,
      loc: [y, x]
    };
  }
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


class Game {
  constructor() {
    this.player1 = new _player__WEBPACK_IMPORTED_MODULE_0__["default"]();
    this.aiPlayer = new _aiPlayer__WEBPACK_IMPORTED_MODULE_1__["default"]();
    this.currentPlayer = this.player1;
    this.player1.init(this.aiPlayer);
    this.aiPlayer.init(this.player1);
  }
  takeTurn() {
    this.currentPlayer = this.currentPlayer.opponent;
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

class Player {
  init(opp) {
    this.opponent = opp;
    this.board = new _gameBoard__WEBPACK_IMPORTED_MODULE_0__["default"]();
  }
  makeAttack([y, x]) {
    if (x < 0 || x > this.board.board[0].length) throw new Error('x coordinate overflow', x);
    if (y < 0 || y > this.board.board[0].length) throw new Error('y coordinate overflow', y);
    return this.opponent.board.receiveAttack([y, x]);
  }

  // startTurn () {
  //   promptAttack ()
  //   endTurn()
  // }
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsQ0FBQ3JELENBQUMsRUFBQ0MsQ0FBQyxDQUFDLENBQUM7RUFDakQ7O0VBRUE7RUFDQTtFQUNBO0VBQ0E7QUFFRjs7Ozs7Ozs7Ozs7Ozs7QUNwQmUsTUFBTTJCLElBQUksQ0FBQztFQUN4Qjs7RUFFQWUsV0FBV0EsQ0FBQ3BDLEdBQUcsRUFBRTRCLE1BQU0sRUFBRTtJQUN2QixJQUFJLENBQUNILE1BQU0sR0FBR3pCLEdBQUc7SUFDakIsSUFBSSxDQUFDNEQsSUFBSSxHQUFHLENBQUM7SUFDYixJQUFJLENBQUNDLElBQUksR0FBRyxLQUFLO0lBQ2pCLElBQUksQ0FBQ0MsUUFBUSxHQUFHbEMsTUFBTTtFQUN4QjtFQUVBc0IsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDVSxJQUFJLElBQUksQ0FBQztJQUNkLElBQUksSUFBSSxDQUFDQSxJQUFJLElBQUksSUFBSSxDQUFDbkMsTUFBTSxFQUFFO01BQzVCLElBQUksQ0FBQ29DLElBQUksR0FBRyxJQUFJO0lBQ2xCO0lBQ0EsT0FBTyxJQUFJLENBQUNELElBQUk7RUFDbEI7RUFFQWxCLE1BQU1BLENBQUEsRUFBRztJQUNQLE9BQU8sSUFBSSxDQUFDbUIsSUFBSTtFQUNsQjtBQUNGOzs7Ozs7VUNyQkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kdWxlcy9haVBsYXllci5qcyIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kdWxlcy9nYW1lQm9hcmQuanMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0Ly4vc3JjL21vZHVsZXMvZ2FtZU1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0Ly4vc3JjL21vZHVsZXMvcGxheWVyLmpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2R1bGVzL3NoaXBCdWlsZGVyLmpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuXG5leHBvcnQgZnVuY3Rpb24gYWRqYWNlbnRTcXVhcmVzIChbeSx4XSkge1xuICAgIGxldCBsaXN0ID0gW1swLDFdLFsxLDBdLFswLC0xXSxbLTEsMF1dXG4gICAgbGlzdCA9IGxpc3QubWFwKChbYSxiXSkgPT4gW2EreSxiK3hdKVxuICAgIHJldHVybiBsaXN0XG4gIH1cbmZ1bmN0aW9uIHJhbmRvbU51bSAobGVuKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpsZW4pXG4gIH1cbiAgXG5mdW5jdGlvbiByYW5kb21Db29yZCAoKSB7XG4gICAgcmV0dXJuIFtyYW5kb21OdW0oMTApLCByYW5kb21OdW0oMTApXVxuICB9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFpIGV4dGVuZHMgUGxheWVyIHtcbiAgICBhaVBsYWNlU2hpcCAobGVuKSB7XG4gICAgICAgIGNvbnN0IHl4ID0gKHJhbmRvbU51bSgyKSkgPyAneScgOiAneCdcbiAgICAgICAgY29uc3QgY29vcmQgPSByYW5kb21Db29yZCgpXG4gICAgICAgIGNvbnN0IHNoaXAgPSB0aGlzLmJvYXJkLnBsYWNlU2hpcChjb29yZCwgbGVuLCB5eClcbiAgICAgICAgaWYgKCFzaGlwKSByZXR1cm4gdGhpcy5haVBsYWNlU2hpcChsZW4pXG4gICAgICAgIHJldHVybiBzaGlwXG4gICAgICB9XG5cbiAgLy8gcGlja3MgYSByYW5kb20gc3F1YXJlIG9uIHRoZSBib2FyZCBhbmQgdGhlbiBzY3JvbGxzIHVwIG9yIGRvd24gdW50aWwgaXQgbGFuZHMgb24gYSB2YWxpZCAobm90IGhpdC9taXNzL3N1bmspIHNxdWFyZSwgdGhlbiBtYWtlcyBhbiBhdHRhY2tcbiAgYWlNYWtlQXR0YWNrICgpIHtcbiAgICBsZXQgW3JuZG15LCBybmRteF0gPSByYW5kb21Db29yZCgpO1xuICAgIGNvbnN0IHJuZG1TY3JvbGwgPSAocmFuZG9tTnVtKDIpKSA/IDEgOiAtMVxuICAgIGxldCBhdGsgPSB0aGlzLm1ha2VBdHRhY2soW3JuZG15LHJuZG14XSlcblxuICAgIHdoaWxlIChhdGsuc3RhdHVzID09PSBcImVycm9yXCIpIHtcbiAgICAgIGlmKHJuZG14IDw9IDApIHtcbiAgICAgICAgcm5kbXggPSA5XG4gICAgICAgIHJuZG15IC09IDFcbiAgICAgICAgaWYocm5kbXkgPCAwKSBybmRteSA9IDlcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJuZG14ID49IDkpIHtcbiAgICAgICAgcm5kbXggPSAwXG4gICAgICAgIHJuZG15ICs9IDFcbiAgICAgICAgaWYocm5kbXkgPiA5KSBybmRteSA9IDBcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBybmRteCArPSBybmRtU2Nyb2xsXG4gICAgICB9XG4gICAgICBhdGsgPSB0aGlzLm1ha2VBdHRhY2soW3JuZG15LCBybmRteF0pXG4gICAgfVxuICAgIHJldHVybiBhdGtcbiAgfVxuXG4gIHN0YXJ0VHVybigpIHtcbiAgICB0aGlzLmFpTWFrZUF0dGFjaygpXG4gICAgZW5kVHVybigpXG4gIH1cbn1cbiIsImltcG9ydCBTaGlwIGZyb20gXCIuL3NoaXBCdWlsZGVyXCI7XG5cbi8vIHRha2VzIHN0YXJ0aW5nIGNvb3JkaW5hdGUgYW5kIGxlbmd0aCBvZiBzaGlwIHRvIGdlbmVyYXRlIHNwYWNlcyBhIHNoaXAgd2lsbCBvY2N1cHlcbmZ1bmN0aW9uIGdlbmVyYXRlQ29vcmRzIChbbGF0LCBsb25dLCBsZW5ndGgsIHl4KSB7XG4gIGlmKGxlbmd0aCA8IDEpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IGF4aXMgPSAoeXggPT09ICd4JykgPyBsb24gOiBsYXRcbiAgaWYgKGF4aXMgKyBsZW5ndGggPiA5KSB0aHJvdyBuZXcgRXJyb3IgKCdDb29yZGluYXRlcyBtdXN0IGFsbCBmYWxsIHdpdGhpbiBib2FyZCcsIGF4aXMrbGVuZ3RoKVxuXG4gIGNvbnN0IGNvb3JkcyA9IFtdXG5cbiAgZm9yIChsZXQgaT0wOyBpPGxlbmd0aDsgaSArPSAxKXtcbiAgICBpZiAoeXggPT09ICd4JykgY29vcmRzLnB1c2goW2xhdCwgbG9uK2ldKVxuICAgIGVsc2UgY29vcmRzLnB1c2goW2xhdCtpLCBsb25dKVxuICB9XG4gIHJldHVybiBjb29yZHNcbn1cblxuLy8gY3JlYXRlcyBhbiB4IGJ5IHggYXJyYXkgZ3JpZCBlcXVhbCB0byBzaXplIGFuZCByZXR1cm5zIGl0XG5mdW5jdGlvbiBpbml0Qm9hcmQoc2l6ZSA9IDEwKSB7XG4gIC8vIEJvYXJkIGtleTpcbiAgLy8gRW1wdHkvRGVmYXVsdCBTcXVhcmUgPSBcIkRcIlxuICAvLyBTcXVhcmUgd2l0aCBzaGlwID0gU2hpcCBhcnJheSBpbmRleCBvZiBzaGlwICgwLTQpXG4gIC8vIEF0dGFja2VkIGVtcHR5IHNxdWFyZSA9IFwiTVwiIGZvciBtaXNzXG4gIC8vIEF0dGFja2VkIHNxdWFyZSB3aXRoIHNoaXAgPSBcIkhcIiBmb3IgaGl0XG4gIC8vIFNxdWFyZSB3aXRoIHN1bmsgc2hpcCA9IFwiU1wiIGZvciBzdW5rXG5cbiAgY29uc3QgYm9hcmQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKz0xKSB7XG4gICAgICBib2FyZC5wdXNoKEFycmF5KHNpemUpLmZpbGwoXCJEXCIpKTtcbiAgfVxuICByZXR1cm4gYm9hcmRcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9hcmQge1xuXG4gIGNvbnN0cnVjdG9yKHNpemUpIHtcbiAgICB0aGlzLmJvYXJkID0gaW5pdEJvYXJkKHNpemUpXG4gICAgdGhpcy5zaGlwcyA9IFtdXG4gIH1cblxuICAvLyBjb21wYXJlcyBjb29yZGluYXRlcyB0byBtYXRjaGluZyBzcGFjZXMgb24gYm9hcmQgZm9yIGV4aXN0aW5nIHNoaXAgcGxhY2VtZW50XG4gIGNvbXBhcmVTaGlwcyAoY29vcmRzKSB7XG4gICAgcmV0dXJuIGNvb3Jkcy5zb21lKChbbGF0LGxvbl0pID0+IHRoaXMuYm9hcmRbbGF0XVtsb25dICE9PSBcIkRcIilcbiAgfVxuXG4gIGdhbWVPdmVyICgpIHtcbiAgICBpZih0aGlzLnNoaXBzLmV2ZXJ5KHNoaXAgPT4gc2hpcC5pc1N1bmsoKSkpe1xuICAgICAgLy8gIGRvIHNvbWUgY29vbCBzdHVmZiwgSSBndWVzc1xuICAgIH1cbiAgfVxuXG4gIC8vICBhY2NlcHRzIGJvYXJkIGNvb3JkaW5hdGVzIChjb29yZCksIGxlbmd0aCwgYW5kIHNoaXAgb3JpZW50YXRpb24gKHh5KSwgcmVqZWN0cyBwbGFjZW1lbnQgaWYgc2hpcCBhbHJlYWR5IGV4aXN0cyB3aXRoIHRob3NlIGNvb3JkaW5hdGVzXG4gIHBsYWNlU2hpcChbbGF0LCBsb25dLCBsZW4sIHl4KSB7XG5cbiAgICBpZihsZW4gPCAxKSByZXR1cm4gZmFsc2VcblxuICAgIGNvbnN0IGNvb3JkcyA9IGdlbmVyYXRlQ29vcmRzKFtsYXQsIGxvbl0sIGxlbiwgeXgpXG5cblxuICAgIGlmICh0aGlzLmNvbXBhcmVTaGlwcyhjb29yZHMpKSB0aHJvdyBuZXcgRXJyb3IoYHNoaXAgYWxyZWFkeSBhdCB0aGVzZSBjb29yZGluYXRlcywgJHtbY29vcmRzXX1gKVxuICAgIHRoaXMuc2hpcHMucHVzaChuZXcgU2hpcChsZW4sIGNvb3JkcykpXG4gICAgY29vcmRzLmZvckVhY2goKFtjMSxjMl0pID0+IHtcbiAgICAgIHRoaXMuYm9hcmRbYzFdW2MyXSA9IHRoaXMuc2hpcHMubGVuZ3RoLTFcbiAgICB9KVxuXG4gICAgcmV0dXJuIGNvb3Jkc1xuICB9XG5cblxuICByZWNlaXZlQXR0YWNrIChbeSx4XSkge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuYm9hcmRbeV1beF1cbiAgICBsZXQgc3RhdHVzO1xuICAgIGlmKHRhcmdldCA9PT0gJ00nIHx8IHRhcmdldCA9PT0gJ0gnIHx8IHRhcmdldCA9PT0gJ1MnKSB7XG4gICAgICBzdGF0dXMgPSBcImVycm9yXCJcbiAgICAgIC8vIHRocm93IG5ldyBFcnJvcihgY29vcmRpbmF0ZSBhbHJlYWR5IG1hcmtlZCwgJHtbeSx4XX1gKVxuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSBcIkRcIikge1xuICAgICAgdGhpcy5ib2FyZFt5XVt4XSA9IFwiTVwiIFxuICAgICAgc3RhdHVzID0gXCJNXCJcbiAgICB9XG4gICAgZWxzZSBpZiAoTnVtYmVyLmlzSW50ZWdlcih0YXJnZXQpKSB7XG4gICAgICB0aGlzLnNoaXBzW3RhcmdldF0uaXNIaXQoKVxuICAgICAgc3RhdHVzID0gXCJIXCJcbiAgICAgIGlmICh0aGlzLnNoaXBzW3RhcmdldF0uaXNTdW5rKCkpIHtcbiAgICAgICAgdGhpcy5nYW1lT3ZlcigpXG4gICAgICAgIHN0YXR1cyA9IFwiU1wiXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7c3RhdHVzLCBsb2M6W3kseF19XG4gIH1cbn0iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuL3BsYXllclwiO1xuaW1wb3J0IEFpIGZyb20gXCIuL2FpUGxheWVyXCI7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5wbGF5ZXIxID0gbmV3IFBsYXllcigpXG4gICAgICAgIHRoaXMuYWlQbGF5ZXIgPSBuZXcgQWkoKVxuICAgICAgICB0aGlzLmN1cnJlbnRQbGF5ZXIgPSB0aGlzLnBsYXllcjFcbiAgICAgICAgdGhpcy5wbGF5ZXIxLmluaXQodGhpcy5haVBsYXllcilcbiAgICAgICAgdGhpcy5haVBsYXllci5pbml0KHRoaXMucGxheWVyMSlcbiAgICB9XG5cbiAgICB0YWtlVHVybiAoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudFBsYXllciA9IHRoaXMuY3VycmVudFBsYXllci5vcHBvbmVudFxuICAgIH1cbn0iLCJpbXBvcnQgQm9hcmQgZnJvbSBcIi4vZ2FtZUJvYXJkXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG5cbiAgaW5pdCAob3BwKSB7XG4gICAgdGhpcy5vcHBvbmVudCA9IG9wcFxuICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgfVxuXG4gIG1ha2VBdHRhY2sgKFt5LHhdKSB7XG4gICAgaWYoeCA8IDAgfHwgeCA+IHRoaXMuYm9hcmQuYm9hcmRbMF0ubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IgKCd4IGNvb3JkaW5hdGUgb3ZlcmZsb3cnLCB4KVxuICAgIGlmKHkgPCAwIHx8IHkgPiB0aGlzLmJvYXJkLmJvYXJkWzBdLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yICgneSBjb29yZGluYXRlIG92ZXJmbG93JywgeSlcbiAgICByZXR1cm4gdGhpcy5vcHBvbmVudC5ib2FyZC5yZWNlaXZlQXR0YWNrKFt5LHhdKVxuICB9XG5cbiAgLy8gc3RhcnRUdXJuICgpIHtcbiAgLy8gICBwcm9tcHRBdHRhY2sgKClcbiAgLy8gICBlbmRUdXJuKClcbiAgLy8gfVxuXG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hpcCB7XG4gIC8vIGZ1bmN0aW9uYWxpdHkgZm9yIGluZGl2aWR1YWwgc2hpcHNcblxuICBjb25zdHJ1Y3RvcihsZW4sIGNvb3Jkcykge1xuICAgIHRoaXMubGVuZ3RoID0gbGVuO1xuICAgIHRoaXMuaGl0cyA9IDA7XG4gICAgdGhpcy5zdW5rID0gZmFsc2U7XG4gICAgdGhpcy5sb2NhdGlvbiA9IGNvb3JkcztcbiAgfVxuXG4gIGlzSGl0KCkge1xuICAgIHRoaXMuaGl0cyArPSAxO1xuICAgIGlmICh0aGlzLmhpdHMgPj0gdGhpcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc3VuayA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhpdHM7XG4gIH1cblxuICBpc1N1bmsoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3VuaztcbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgc3RhcnRHYW1lIGZyb20gXCIuL21vZHVsZXMvZ2FtZU1hbmFnZXJcIjtcblxuIl0sIm5hbWVzIjpbIlBsYXllciIsImFkamFjZW50U3F1YXJlcyIsInkiLCJ4IiwibGlzdCIsIm1hcCIsImEiLCJiIiwicmFuZG9tTnVtIiwibGVuIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwicmFuZG9tQ29vcmQiLCJBaSIsImFpUGxhY2VTaGlwIiwieXgiLCJjb29yZCIsInNoaXAiLCJib2FyZCIsInBsYWNlU2hpcCIsImFpTWFrZUF0dGFjayIsInJuZG15Iiwicm5kbXgiLCJybmRtU2Nyb2xsIiwiYXRrIiwibWFrZUF0dGFjayIsInN0YXR1cyIsInN0YXJ0VHVybiIsImVuZFR1cm4iLCJTaGlwIiwiZ2VuZXJhdGVDb29yZHMiLCJsYXQiLCJsb24iLCJsZW5ndGgiLCJheGlzIiwiRXJyb3IiLCJjb29yZHMiLCJpIiwicHVzaCIsImluaXRCb2FyZCIsInNpemUiLCJBcnJheSIsImZpbGwiLCJCb2FyZCIsImNvbnN0cnVjdG9yIiwic2hpcHMiLCJjb21wYXJlU2hpcHMiLCJzb21lIiwiZ2FtZU92ZXIiLCJldmVyeSIsImlzU3VuayIsImZvckVhY2giLCJjMSIsImMyIiwicmVjZWl2ZUF0dGFjayIsInRhcmdldCIsIk51bWJlciIsImlzSW50ZWdlciIsImlzSGl0IiwibG9jIiwiR2FtZSIsInBsYXllcjEiLCJhaVBsYXllciIsImN1cnJlbnRQbGF5ZXIiLCJpbml0IiwidGFrZVR1cm4iLCJvcHBvbmVudCIsIm9wcCIsImhpdHMiLCJzdW5rIiwibG9jYXRpb24iLCJzdGFydEdhbWUiXSwic291cmNlUm9vdCI6IiJ9