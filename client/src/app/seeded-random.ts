/** Whole random numbers; see SeededRandom. */
export interface RandomInts {
  /** A whole number from 0 up to, but not including, `bound`. */
  nextInt(bound: number): number;
}

/**
 * Random numbers from a seed (the mulberry32 generator): the same seed gives the same numbers in
 * every browser and on the server, so they all agree on what happens.
 */
export class SeededRandom implements RandomInts {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** A whole number from 0 up to, but not including, `bound`. */
  nextInt(bound: number): number {
    return Math.floor(this.next() * bound);
  }

  /** A number from 0 up to, but not including, 1. */
  private next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  }
}
