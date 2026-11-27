import { SeededRandom } from './seeded-random';

/** All 32 bits of each number, so a change to even the lowest bit shows. */
const FULL_RANGE = 2 ** 32;

/** What seed 1 gives first. Pinned, so the server's copy of the generator can be checked. */
const SEED_1_NUMBERS = [2693262067, 11749833, 2265367787, 4213581821];

/** The first 4 numbers from `seed`, over the full range. */
function firstNumbers(seed: number): number[] {
  const random = new SeededRandom(seed);
  return Array.from({ length: 4 }, () => random.nextInt(FULL_RANGE));
}

describe('SeededRandom', () => {
  it('gives the same numbers for the same seed, the ones the server must give too', () => {
    expect(firstNumbers(1)).toEqual(SEED_1_NUMBERS);
    expect(firstNumbers(1)).toEqual(firstNumbers(1));
    expect(firstNumbers(2)).not.toEqual(firstNumbers(1));
  });
});
