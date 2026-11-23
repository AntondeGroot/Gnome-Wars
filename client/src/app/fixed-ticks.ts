/**
 * After a long pause (a background tab, where the browser stops calling requestAnimationFrame) the
 * elapsed time would be minutes; catching up on all of it would freeze the page running thousands
 * of ticks. Anything longer than this is dropped: the game simply pauses with the tab.
 */
const MAX_CATCH_UP_MS = 250;

/**
 * Turns frame times into game ticks at a fixed rate, whatever the screen's refresh rate.
 *
 * Each frame adds the time since the previous frame to an "accumulator", then spends it a whole
 * tick at a time; what's left over carries to the next frame. At 30 ticks per second a 60 Hz screen
 * gets a tick every other frame and a 144 Hz screen one every ~5 frames, so the game runs at the
 * same speed on both.
 */
export class FixedTicks {
  private previousTime: number | null = null;
  private accumulated = 0;

  constructor(private readonly tickMs: number) {}

  /** How many ticks the game should advance for the frame at `time` (ms, as from requestAnimationFrame). */
  ticksDue(time: number): number {
    const elapsed = this.previousTime === null ? 0 : time - this.previousTime;
    this.previousTime = time;
    this.accumulated += Math.min(elapsed, MAX_CATCH_UP_MS);

    const ticks = Math.floor(this.accumulated / this.tickMs);
    this.accumulated -= ticks * this.tickMs;
    return ticks;
  }
}
