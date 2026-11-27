import POD_RULES from '../../../shared/rules/pods.json';
import { Match } from './match';
import { RandomInts } from './seeded-random';

/** "Random" numbers that are always 0: every breakable drops one, of the first kind (range). */
const ALWAYS_ZERO: RandomInts = { nextInt: () => 0 };
const PLANTED_AT = 10;
const BURNT_OUT_AT = PLANTED_AT + POD_RULES.fuseTicks;

describe('Match', () => {
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
