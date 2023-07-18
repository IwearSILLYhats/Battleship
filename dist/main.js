/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
      return {
        status
      };
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

function randomNum(len) {
  return Math.floor(Math.random() * len);
}
function randomCoord() {
  return [randomNum(10), randomNum(10)];
}
class Player {
  adjacentSquares([y, x]) {
    let list = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    list = list.map(([a, b]) => [a + y, b + x]);
    return list;
  }

  // picks a random square on the board and then scrolls up or down until it lands on a valid (not hit/miss/sunk) square, then makes an attack
  aiMakeAttack() {
    let [rndmy, rndmx] = randomCoord();
    const rndmScroll = randomNum(2) ? 1 : -1;
    let atk = this.makeAttack([rndmy, rndmx]);
    while (atk.status !== "H" || atk.status !== "M") {
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
      console.log(atk);
    }
    return atk;
  }
  aiPlaceShip(len) {
    const yx = randomNum(2) ? 'y' : 'x';
    const coord = randomCoord();
    const ship = this.board.placeShip(coord, len, yx);
    if (!ship) return this.aiPlaceShip(len);
    return ship;
  }
  init(opp) {
    this.opponent = opp;
    this.board = new _gameBoard__WEBPACK_IMPORTED_MODULE_0__["default"]();
  }
  makeAttack([y, x]) {
    if (x < 0 || x > this.board.board[0].length) throw new Error('x coordinate overflow', x);
    if (y < 0 || y > this.board.board[0].length) throw new Error('y coordinate overflow', y);
    return this.opponent.board.receiveAttack([y, x]);
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
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ startGame)
/* harmony export */ });
/* harmony import */ var _modules_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/player */ "./src/modules/player.js");

function startGame() {
  const player1 = new _modules_player__WEBPACK_IMPORTED_MODULE_0__["default"]();
  const aiPlayer = new _modules_player__WEBPACK_IMPORTED_MODULE_0__["default"]();
  player1.init(aiPlayer);
  aiPlayer.init(player1);
  return {
    player1,
    aiPlayer
  };
}
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SSxDQUFDd0MsSUFBSTtFQUNsQjtBQUNGOzs7Ozs7VUNyQkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ05zQztBQUV2QixTQUFTRSxTQUFTQSxDQUFBLEVBQUk7RUFDakMsTUFBTUMsT0FBTyxHQUFHLElBQUl2Qix1REFBTSxDQUFDLENBQUM7RUFDNUIsTUFBTXdCLFFBQVEsR0FBRyxJQUFJeEIsdURBQU0sQ0FBQyxDQUFDO0VBQzdCdUIsT0FBTyxDQUFDUCxJQUFJLENBQUNRLFFBQVEsQ0FBQztFQUN0QkEsUUFBUSxDQUFDUixJQUFJLENBQUNPLE9BQU8sQ0FBQztFQUN0QixPQUFPO0lBQUNBLE9BQU87SUFBRUM7RUFBUSxDQUFDO0FBQzlCLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3QvLi9zcmMvbW9kdWxlcy9nYW1lQm9hcmQuanMiLCJ3ZWJwYWNrOi8vbXktd2VicGFjay1wcm9qZWN0Ly4vc3JjL21vZHVsZXMvcGxheWVyLmpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9tb2R1bGVzL3NoaXBCdWlsZGVyLmpzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9teS13ZWJwYWNrLXByb2plY3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL215LXdlYnBhY2stcHJvamVjdC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwQnVpbGRlclwiO1xuXG4vLyB0YWtlcyBzdGFydGluZyBjb29yZGluYXRlIGFuZCBsZW5ndGggb2Ygc2hpcCB0byBnZW5lcmF0ZSBzcGFjZXMgYSBzaGlwIHdpbGwgb2NjdXB5XG5mdW5jdGlvbiBnZW5lcmF0ZUNvb3JkcyAoW2xhdCwgbG9uXSwgbGVuZ3RoLCB5eCkge1xuICBpZihsZW5ndGggPCAxKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBheGlzID0gKHl4ID09PSAneCcpID8gbG9uIDogbGF0XG4gIGlmIChheGlzICsgbGVuZ3RoID4gOSkgdGhyb3cgbmV3IEVycm9yICgnQ29vcmRpbmF0ZXMgbXVzdCBhbGwgZmFsbCB3aXRoaW4gYm9hcmQnLCBheGlzK2xlbmd0aClcblxuICBjb25zdCBjb29yZHMgPSBbXVxuXG4gIGZvciAobGV0IGk9MDsgaTxsZW5ndGg7IGkgKz0gMSl7XG4gICAgaWYgKHl4ID09PSAneCcpIGNvb3Jkcy5wdXNoKFtsYXQsIGxvbitpXSlcbiAgICBlbHNlIGNvb3Jkcy5wdXNoKFtsYXQraSwgbG9uXSlcbiAgfVxuICByZXR1cm4gY29vcmRzXG59XG5cbi8vIGNyZWF0ZXMgYW4geCBieSB4IGFycmF5IGdyaWQgZXF1YWwgdG8gc2l6ZSBhbmQgcmV0dXJucyBpdFxuZnVuY3Rpb24gaW5pdEJvYXJkKHNpemUgPSAxMCkge1xuICAvLyBCb2FyZCBrZXk6XG4gIC8vIEVtcHR5L0RlZmF1bHQgU3F1YXJlID0gXCJEXCJcbiAgLy8gU3F1YXJlIHdpdGggc2hpcCA9IFNoaXAgYXJyYXkgaW5kZXggb2Ygc2hpcCAoMC00KVxuICAvLyBBdHRhY2tlZCBlbXB0eSBzcXVhcmUgPSBcIk1cIiBmb3IgbWlzc1xuICAvLyBBdHRhY2tlZCBzcXVhcmUgd2l0aCBzaGlwID0gXCJIXCIgZm9yIGhpdFxuICAvLyBTcXVhcmUgd2l0aCBzdW5rIHNoaXAgPSBcIlNcIiBmb3Igc3Vua1xuXG4gIGNvbnN0IGJvYXJkID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSs9MSkge1xuICAgICAgYm9hcmQucHVzaChBcnJheShzaXplKS5maWxsKFwiRFwiKSk7XG4gIH1cbiAgcmV0dXJuIGJvYXJkXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvYXJkIHtcblxuICBjb25zdHJ1Y3RvcihzaXplKSB7XG4gICAgdGhpcy5ib2FyZCA9IGluaXRCb2FyZChzaXplKVxuICAgIHRoaXMuc2hpcHMgPSBbXVxuICB9XG5cbiAgLy8gY29tcGFyZXMgY29vcmRpbmF0ZXMgdG8gbWF0Y2hpbmcgc3BhY2VzIG9uIGJvYXJkIGZvciBleGlzdGluZyBzaGlwIHBsYWNlbWVudFxuICBjb21wYXJlU2hpcHMgKGNvb3Jkcykge1xuICAgIHJldHVybiBjb29yZHMuc29tZSgoW2xhdCxsb25dKSA9PiB0aGlzLmJvYXJkW2xhdF1bbG9uXSAhPT0gXCJEXCIpXG4gIH1cblxuICBnYW1lT3ZlciAoKSB7XG4gICAgaWYodGhpcy5zaGlwcy5ldmVyeShzaGlwID0+IHNoaXAuaXNTdW5rKCkpKXtcbiAgICAgIC8vICBkbyBzb21lIGNvb2wgc3R1ZmYsIEkgZ3Vlc3NcbiAgICB9XG4gIH1cblxuICAvLyAgYWNjZXB0cyBib2FyZCBjb29yZGluYXRlcyAoY29vcmQpLCBsZW5ndGgsIGFuZCBzaGlwIG9yaWVudGF0aW9uICh4eSksIHJlamVjdHMgcGxhY2VtZW50IGlmIHNoaXAgYWxyZWFkeSBleGlzdHMgd2l0aCB0aG9zZSBjb29yZGluYXRlc1xuICBwbGFjZVNoaXAoW2xhdCwgbG9uXSwgbGVuLCB5eCkge1xuXG4gICAgaWYobGVuIDwgMSkgcmV0dXJuIGZhbHNlXG5cbiAgICBjb25zdCBjb29yZHMgPSBnZW5lcmF0ZUNvb3JkcyhbbGF0LCBsb25dLCBsZW4sIHl4KVxuXG5cbiAgICBpZiAodGhpcy5jb21wYXJlU2hpcHMoY29vcmRzKSkgdGhyb3cgbmV3IEVycm9yKGBzaGlwIGFscmVhZHkgYXQgdGhlc2UgY29vcmRpbmF0ZXMsICR7W2Nvb3Jkc119YClcbiAgICB0aGlzLnNoaXBzLnB1c2gobmV3IFNoaXAobGVuLCBjb29yZHMpKVxuICAgIGNvb3Jkcy5mb3JFYWNoKChbYzEsYzJdKSA9PiB7XG4gICAgICB0aGlzLmJvYXJkW2MxXVtjMl0gPSB0aGlzLnNoaXBzLmxlbmd0aC0xXG4gICAgfSlcblxuICAgIHJldHVybiBjb29yZHNcbiAgfVxuXG5cbiAgcmVjZWl2ZUF0dGFjayAoW3kseF0pIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmJvYXJkW3ldW3hdXG4gICAgbGV0IHN0YXR1cztcbiAgICBpZih0YXJnZXQgPT09ICdNJyB8fCB0YXJnZXQgPT09ICdIJyB8fCB0YXJnZXQgPT09ICdTJykge1xuICAgICAgc3RhdHVzID0gXCJlcnJvclwiXG4gICAgICByZXR1cm4ge3N0YXR1c31cbiAgICAgIC8vIHRocm93IG5ldyBFcnJvcihgY29vcmRpbmF0ZSBhbHJlYWR5IG1hcmtlZCwgJHtbeSx4XX1gKVxuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSBcIkRcIikge1xuICAgICAgdGhpcy5ib2FyZFt5XVt4XSA9IFwiTVwiIFxuICAgICAgc3RhdHVzID0gXCJNXCJcbiAgICB9XG4gICAgZWxzZSBpZiAoTnVtYmVyLmlzSW50ZWdlcih0YXJnZXQpKSB7XG4gICAgICB0aGlzLnNoaXBzW3RhcmdldF0uaXNIaXQoKVxuICAgICAgc3RhdHVzID0gXCJIXCJcbiAgICAgIGlmICh0aGlzLnNoaXBzW3RhcmdldF0uaXNTdW5rKCkpIHtcbiAgICAgICAgdGhpcy5nYW1lT3ZlcigpXG4gICAgICAgIHN0YXR1cyA9IFwiU1wiXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7c3RhdHVzLCBsb2M6W3kseF19XG4gIH1cbn0iLCJpbXBvcnQgQm9hcmQgZnJvbSBcIi4vZ2FtZUJvYXJkXCI7XG5cbmZ1bmN0aW9uIHJhbmRvbU51bSAobGVuKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqbGVuKVxufVxuXG5mdW5jdGlvbiByYW5kb21Db29yZCAoKSB7XG4gIHJldHVybiBbcmFuZG9tTnVtKDEwKSwgcmFuZG9tTnVtKDEwKV1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyIHtcblxuICBhZGphY2VudFNxdWFyZXMgKFt5LHhdKSB7XG4gICAgbGV0IGxpc3QgPSBbWzAsMV0sWzEsMF0sWzAsLTFdLFstMSwwXV1cbiAgICBsaXN0ID0gbGlzdC5tYXAoKFthLGJdKSA9PiBbYSt5LGIreF0pXG4gICAgcmV0dXJuIGxpc3RcbiAgfVxuXG4gIC8vIHBpY2tzIGEgcmFuZG9tIHNxdWFyZSBvbiB0aGUgYm9hcmQgYW5kIHRoZW4gc2Nyb2xscyB1cCBvciBkb3duIHVudGlsIGl0IGxhbmRzIG9uIGEgdmFsaWQgKG5vdCBoaXQvbWlzcy9zdW5rKSBzcXVhcmUsIHRoZW4gbWFrZXMgYW4gYXR0YWNrXG4gIGFpTWFrZUF0dGFjayAoKSB7XG4gICAgbGV0IFtybmRteSwgcm5kbXhdID0gcmFuZG9tQ29vcmQoKTtcbiAgICBjb25zdCBybmRtU2Nyb2xsID0gKHJhbmRvbU51bSgyKSkgPyAxIDogLTFcbiAgICBsZXQgYXRrID0gdGhpcy5tYWtlQXR0YWNrKFtybmRteSxybmRteF0pXG5cbiAgICB3aGlsZSAoYXRrLnN0YXR1cyAhPT0gXCJIXCIgfHwgYXRrLnN0YXR1cyAhPT0gXCJNXCIpIHtcbiAgICAgIGlmKHJuZG14IDw9IDApIHtcbiAgICAgICAgcm5kbXggPSA5XG4gICAgICAgIHJuZG15IC09IDFcbiAgICAgICAgaWYocm5kbXkgPCAwKSBybmRteSA9IDlcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJuZG14ID49IDkpIHtcbiAgICAgICAgcm5kbXggPSAwXG4gICAgICAgIHJuZG15ICs9IDFcbiAgICAgICAgaWYocm5kbXkgPiA5KSBybmRteSA9IDBcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBybmRteCArPSBybmRtU2Nyb2xsXG4gICAgICB9XG4gICAgICBhdGsgPSB0aGlzLm1ha2VBdHRhY2soW3JuZG15LCBybmRteF0pXG4gICAgICBjb25zb2xlLmxvZyhhdGspXG4gICAgfVxuICAgIHJldHVybiBhdGtcbiAgfVxuXG4gIGFpUGxhY2VTaGlwIChsZW4pIHtcbiAgICBjb25zdCB5eCA9IChyYW5kb21OdW0oMikpID8gJ3knIDogJ3gnXG4gICAgY29uc3QgY29vcmQgPSByYW5kb21Db29yZCgpXG4gICAgY29uc3Qgc2hpcCA9IHRoaXMuYm9hcmQucGxhY2VTaGlwKGNvb3JkLCBsZW4sIHl4KVxuICAgIGlmICghc2hpcCkgcmV0dXJuIHRoaXMuYWlQbGFjZVNoaXAobGVuKVxuICAgIHJldHVybiBzaGlwXG4gIH1cblxuICBpbml0IChvcHApIHtcbiAgICB0aGlzLm9wcG9uZW50ID0gb3BwXG4gICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpO1xuICB9XG5cbiAgbWFrZUF0dGFjayAoW3kseF0pIHtcbiAgICBpZih4IDwgMCB8fCB4ID4gdGhpcy5ib2FyZC5ib2FyZFswXS5sZW5ndGgpIHRocm93IG5ldyBFcnJvciAoJ3ggY29vcmRpbmF0ZSBvdmVyZmxvdycsIHgpXG4gICAgaWYoeSA8IDAgfHwgeSA+IHRoaXMuYm9hcmQuYm9hcmRbMF0ubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IgKCd5IGNvb3JkaW5hdGUgb3ZlcmZsb3cnLCB5KVxuICAgIHJldHVybiB0aGlzLm9wcG9uZW50LmJvYXJkLnJlY2VpdmVBdHRhY2soW3kseF0pXG4gIH1cblxufVxuXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTaGlwIHtcbiAgLy8gZnVuY3Rpb25hbGl0eSBmb3IgaW5kaXZpZHVhbCBzaGlwc1xuXG4gIGNvbnN0cnVjdG9yKGxlbiwgY29vcmRzKSB7XG4gICAgdGhpcy5sZW5ndGggPSBsZW47XG4gICAgdGhpcy5oaXRzID0gMDtcbiAgICB0aGlzLnN1bmsgPSBmYWxzZTtcbiAgICB0aGlzLmxvY2F0aW9uID0gY29vcmRzO1xuICB9XG5cbiAgaXNIaXQoKSB7XG4gICAgdGhpcy5oaXRzICs9IDE7XG4gICAgaWYgKHRoaXMuaGl0cyA+PSB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhpcy5zdW5rID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaGl0cztcbiAgfVxuXG4gIGlzU3VuaygpIHtcbiAgICByZXR1cm4gdGhpcy5zdW5rO1xuICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4vbW9kdWxlcy9wbGF5ZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RhcnRHYW1lICgpIHtcbiAgICBjb25zdCBwbGF5ZXIxID0gbmV3IFBsYXllcigpXG4gICAgY29uc3QgYWlQbGF5ZXIgPSBuZXcgUGxheWVyKClcbiAgICBwbGF5ZXIxLmluaXQoYWlQbGF5ZXIpXG4gICAgYWlQbGF5ZXIuaW5pdChwbGF5ZXIxKVxuICAgIHJldHVybiB7cGxheWVyMSwgYWlQbGF5ZXJ9XG59Il0sIm5hbWVzIjpbIlNoaXAiLCJnZW5lcmF0ZUNvb3JkcyIsImxhdCIsImxvbiIsImxlbmd0aCIsInl4IiwiYXhpcyIsIkVycm9yIiwiY29vcmRzIiwiaSIsInB1c2giLCJpbml0Qm9hcmQiLCJzaXplIiwiYm9hcmQiLCJBcnJheSIsImZpbGwiLCJCb2FyZCIsImNvbnN0cnVjdG9yIiwic2hpcHMiLCJjb21wYXJlU2hpcHMiLCJzb21lIiwiZ2FtZU92ZXIiLCJldmVyeSIsInNoaXAiLCJpc1N1bmsiLCJwbGFjZVNoaXAiLCJsZW4iLCJmb3JFYWNoIiwiYzEiLCJjMiIsInJlY2VpdmVBdHRhY2siLCJ5IiwieCIsInRhcmdldCIsInN0YXR1cyIsIk51bWJlciIsImlzSW50ZWdlciIsImlzSGl0IiwibG9jIiwicmFuZG9tTnVtIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwicmFuZG9tQ29vcmQiLCJQbGF5ZXIiLCJhZGphY2VudFNxdWFyZXMiLCJsaXN0IiwibWFwIiwiYSIsImIiLCJhaU1ha2VBdHRhY2siLCJybmRteSIsInJuZG14Iiwicm5kbVNjcm9sbCIsImF0ayIsIm1ha2VBdHRhY2siLCJjb25zb2xlIiwibG9nIiwiYWlQbGFjZVNoaXAiLCJjb29yZCIsImluaXQiLCJvcHAiLCJvcHBvbmVudCIsImhpdHMiLCJzdW5rIiwibG9jYXRpb24iLCJzdGFydEdhbWUiLCJwbGF5ZXIxIiwiYWlQbGF5ZXIiXSwic291cmNlUm9vdCI6IiJ9