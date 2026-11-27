import POD_RULES from '../../../../../shared/rules/pods.json';
import { Match } from './match';
import { RandomInts } from './seeded-random';

/** "Random" numbers that are always 0: every breakable drops one, of the first kind (range). */
const ALWAYS_ZERO: RandomInts = { nextInt: () => 0 };
const PLANTED_AT = 10;
const BURNT_OUT_AT = PLANTED_AT + POD_RULES.fuseTicks;

describe('Match', () => {
  it('walks a gnome on sand at the speed percent the map gives sand', () => {
    // One row of sand, walked at 50%: the player starts on (0, 0) at 30 units a second.
    const sandRow = {
      grid: ['░░░░░'],
      legend: {},
      walkable: ['░'],
      speedPercentOn: { '░': 50 },
    };
    const match = new Match(sandRow, [{ tile: { x: 0, y: 0 }, skin: 'red' }], ALWAYS_ZERO);

    [1, 2, 3, 4].forEach((tick) => match.tick('right', false, tick));

    // Half of the 4 units it would walk in 4 ticks on grass.
    expect(match.player.x).toBe(2);
  });

  it('slows a gnome down only once the tile under its centre is sand', () => {
    // Grass on (0, 0) and (1, 0), sand from (2, 0). The player starts on (1, 0), at x = 16.
    const grassThenSand = {
      grid: ['..░░░'],
      legend: {},
      walkable: ['.', '░'],
      speedPercentOn: { '░': 50 },
    };
    const match = new Match(grassThenSand, [{ tile: { x: 1, y: 0 }, skin: 'red' }], ALWAYS_ZERO);

    const xAfterEachTick = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tick) => {
      match.tick('right', false, tick);
      return match.player.x;
    });

    // Already partly on the sand from x = 17, but at full speed until x = 24, where its centre
    // crosses onto (2, 0). Then 1 unit every other tick.
    expect(xAfterEachTick).toEqual([17, 18, 19, 20, 21, 22, 23, 24, 24, 25]);
  });

  it('keeps the power-up a hedge drops, though the blast that broke it lies on its tile', () => {
    // One row: the player on (0, 0), a hedge right next to it on (1, 0).
    const hedgeRow = { grid: ['.h...'], legend: { h: 'hedge' }, walkable: ['.'], breakable: ['h'] };
    const match = new Match(hedgeRow, [{ tile: { x: 0, y: 0 }, skin: 'red' }], ALWAYS_ZERO);

    match.tick(null, true, PLANTED_AT);
    match.tick(null, false, BURNT_OUT_AT);

    expect(match.breakables.has({ x: 1, y: 0 })).toBe(false);
    expect(match.powerUps.all).toEqual([{ tile: { x: 1, y: 0 }, kind: 'range' }]);
  });
});
