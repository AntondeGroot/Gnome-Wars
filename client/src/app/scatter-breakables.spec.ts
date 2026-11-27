import { ArenaMap, BACKYARD } from './arena-map';
import { scatterBreakables } from './game/rules/scatter-breakables';
import { RandomInts, SeededRandom } from './game/rules/seeded-random';

/** "Random" numbers that are always 0: every allowed tile gets a breakable, the first it allows. */
const ALWAYS_ZERO: RandomInts = { nextInt: () => 0 };

/** "Random" numbers that come in the given order. */
function rolls(...numbers: number[]): RandomInts {
  return { nextInt: () => numbers.shift() ?? 0 };
}

/** A 5 × 3 lawn with start tile 1 in the top-left corner; any grass tile may get a hedge. */
const LAWN_WITH_START: ArenaMap = {
  grid: ['1....', '.....', '.....'],
  legend: { '1': null },
  walkable: ['.', '1'],
  scatter: { percent: 100, on: { '.': ['hedge'] } },
};

describe('scatterBreakables', () => {
  it('keeps start tiles, the tiles gnomes start on, and the tiles next to them clear', () => {
    const gnomeStart = { x: 3, y: 2 };

    const tiles = scatterBreakables(LAWN_WITH_START, ALWAYS_ZERO, [gnomeStart]).map(
      ({ tile }) => `${tile.x},${tile.y}`,
    );

    // Clear: start tile 1 at (0, 0) with (1, 0) and (0, 1); the gnome's (3, 2) with (2, 2),
    // (4, 2) and (3, 1).
    expect(tiles).toEqual(['2,0', '3,0', '4,0', '1,1', '2,1', '4,1', '0,2', '1,2']);
  });

  it('scatters the backyard the same way for the same seed, so all clients agree', () => {
    const layoutFor = (seed: number) => scatterBreakables(BACKYARD, new SeededRandom(seed));

    expect(layoutFor(1)).toEqual(layoutFor(1));
    expect(layoutFor(2)).not.toEqual(layoutFor(1));
  });

  it('places one when the roll is below percent, picked from what its letter allows', () => {
    // One row: grass, sand, grass.
    const row: ArenaMap = {
      grid: ['.░.'],
      legend: {},
      walkable: ['.', '░'],
      scatter: { percent: 50, on: { '.': ['hedge', 'flower_pot'], '░': ['sandcastle'] } },
    };
    // Grass rolls 49, then picks 1 (flower_pot); sand rolls 49, then picks 0; grass rolls 50.
    const random = rolls(49, 1, 49, 0, 50);

    expect(scatterBreakables(row, random)).toEqual([
      { tile: { x: 0, y: 0 }, frame: 'flower_pot' },
      { tile: { x: 1, y: 0 }, frame: 'sandcastle' },
    ]);
  });
});
