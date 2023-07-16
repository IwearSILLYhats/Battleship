import Ship from "../src/modules/shipBuilder";
import Board from "../src/modules/gameBoard";
import Player from "../src/modules/player";

describe("does the board?", () => {
  const b = new Board();

  test("populate the correct number of rows?", () => {
    expect(b.board.length).toBe(10);
  })
  test("let you place a ship with length 0?", () => {
    expect(b.placeShip([0,0], 0, 'x')).toBe(false)
  })
  test("generate correct coordinates for length 2 ships?", () => {
    expect(b.placeShip([0,0], 2, 'x')).toEqual([[0,0], [0,1]])
  })
  test("prevent you from placing a ship onto another ship?", () => {
    expect(() => {
      b.placeShip([0,0], 2, 'y')}).toThrow("ship already at these coordinates")
  })
  test("report  a miss?", () => {
    expect(b.receiveAttack([1,2])).toMatchObject({status: "M", loc:[1,2]})
  })
  test("prevent you from hitting the same square twice?", () => {
    expect(() => {
      b.receiveAttack([1,2])}).toThrow("coordinate already marked")
  })
  test("report  a hit?", () => {
    expect(b.receiveAttack([0,1])).toMatchObject({status: "H", loc: [0,1]})
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
    expect(target.isHit()).toBe(1);
  });
  test("sink when out of hits?", () => {
    const target = new Ship(1);
    target.isHit();
    expect(target.isSunk()).toBe(true);
  });
});
describe("Does the player?", () => {
  const p = new Player()
  p.init("test")
  test("generate a board when created?", () => {
    expect(p.board.board.length).toBe(10)
  })
  test("generate correct adjacency list?", () => {
    expect(p.adjacentSquares([5,5])).toEqual([[5,6], [6,5], [5,4], [4,5]])
  })
})