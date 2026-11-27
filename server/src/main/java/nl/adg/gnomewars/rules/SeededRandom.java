package nl.adg.gnomewars.rules;

/**
 * Random numbers from a seed (the mulberry32 generator), the same as the client's
 * seeded-random.ts: the same seed gives the same numbers in every browser and on the server.
 */
public final class SeededRandom {

  /** Added to the state before every number; part of mulberry32. */
  private static final int STEP = 0x6d2b79f5;

  /** 2^32: turns a 32-bit number into a fraction from 0 up to, but not including, 1. */
  private static final double FULL_RANGE = 0x1p32;

  private int state;

  public SeededRandom(int seed) {
    this.state = seed;
  }

  /** A whole number from 0 up to, but not including, {@code bound}. */
  public int nextInt(int bound) {
    return (int) Math.floor(next() * bound);
  }

  /** A number from 0 up to, but not including, 1. Java's int overflow matches Math.imul. */
  double next() {
    state += STEP;
    int t = state;
    t = (t ^ (t >>> 15)) * (t | 1);
    t ^= t + (t ^ (t >>> 7)) * (t | 61);
    return Integer.toUnsignedLong(t ^ (t >>> 14)) / FULL_RANGE;
  }
}
