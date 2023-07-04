import Ship from "../src/modules/shipBuilder";
import Board from "../src/modules/gameBoard";

describe("does the board?", () => {
  test("populate the correct number of rows?", () => {
    expect(new Board().board.length).toBe(10);
  })
  test("let you place a ship with length 0?", () => {
    expect(new Board().placeShip([0,0], 0, 'x')).toBe(false)
  })
  test("generate correct coordinates for length 2 ships?", () => {
    expect(new Board().placeShip([0,0], 2, 'x')).toEqual([[0,0], [0,1]])
  })
});

describe("does the ship?", () => {
  test("populate all 3 data points?", () => {
    expect(new Ship(5)).toMatchObject({
      length: 5,
      hits: 0,
      sunk: false,
    });
  });
  test("get hit when shot at?", () => {
    const target = new Ship(2);
    expect(target.hit()).toBe(1);
  });
  test("sink when out of hits?", () => {
    const target = new Ship(1);
    target.hit();
    expect(target.isSunk()).toBe(true);
  });
});