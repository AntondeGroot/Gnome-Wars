import POWER_UP_RULES from '../../../../../shared/rules/power-ups.json';
import { Gnome } from '../../gnome/gnome';
import { Blast } from '../../pods/blast';
import { RandomInts } from './seeded-random';
import { Walls } from './walls';
import { PowerUps } from './power-ups';

/** An 8 × 8 tile lawn without walls, so a gnome can stand anywhere near its middle. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
  tiles: { '.': { walkable: true } },
});

/** "Random" numbers that come in the given order. */
function rolls(...numbers: number[]): RandomInts {
  return { nextInt: () => numbers.shift() ?? 0 };
}

/** "Random" numbers that are always 0: every breakable drops one, of the first kind (range). */
const ALWAYS_ZERO: RandomInts = { nextInt: () => 0 };

describe('PowerUps', () => {
  it('gives a gnome walking over a power-up its effect, and takes it off the lawn', () => {
    const powerUps = new PowerUps(ALWAYS_ZERO);
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    powerUps.dropAt([{ x: 2, y: 3 }]);

    powerUps.pickUp([gnome]);

    expect(gnome.stats.blastRange).toBe(2);
    expect(powerUps.all).toEqual([]);
  });

  it('gives a power-up two gnomes reach on the same tick to the lower player number', () => {
    const powerUps = new PowerUps(ALWAYS_ZERO);
    // Players 1 and 2, both with their centre on tile (2, 3), the second from the right.
    const playerOne = new Gnome(32, 48, OPEN_LAWN);
    const playerTwo = new Gnome(39, 48, OPEN_LAWN);
    powerUps.dropAt([{ x: 2, y: 3 }]);

    powerUps.pickUp([playerOne, playerTwo]);

    expect(playerOne.stats.blastRange).toBe(2);
    expect(playerTwo.stats.blastRange).toBe(1);
  });

  it('drops a power-up only when the roll out of 100 is below dropPercent', () => {
    // First tile: a roll just below dropPercent, then kind 2 (speed). Second: a roll of exactly it.
    const powerUps = new PowerUps(
      rolls(POWER_UP_RULES.dropPercent - 1, 2, POWER_UP_RULES.dropPercent),
    );

    powerUps.dropAt([
      { x: 2, y: 3 },
      { x: 5, y: 3 },
    ]);

    expect(powerUps.all).toEqual([{ tile: { x: 2, y: 3 }, kind: 'speed' }]);
  });

  it('destroys a power-up a blast bursts over, and leaves the others', () => {
    const powerUps = new PowerUps(ALWAYS_ZERO);
    powerUps.dropAt([
      { x: 3, y: 3 },
      { x: 6, y: 3 },
    ]);
    const blastOverTheFirst: Blast = {
      cells: [{ tile: { x: 3, y: 3 }, part: 'end', direction: 'right' }],
      startedAt: 10,
    };

    powerUps.destroyUnder([blastOverTheFirst]);

    expect(powerUps.all).toEqual([{ tile: { x: 6, y: 3 }, kind: 'range' }]);
  });
});
