import { FixedTicks } from './fixed-ticks';

const TICK_MS = 1000 / 30;

/** Total ticks over `seconds` of frames at `refreshRate` frames per second, starting at time 0. */
function ticksOver(seconds: number, refreshRate: number): number {
  const ticks = new FixedTicks(TICK_MS);
  let total = 0;
  for (let frame = 0; frame <= seconds * refreshRate; frame++) {
    total += ticks.ticksDue((frame * 1000) / refreshRate);
  }
  return total;
}

describe('FixedTicks', () => {
  it('advances the game at the same speed on a 60 Hz and a 144 Hz screen', () => {
    const at60Hz = ticksOver(10, 60);
    const at144Hz = ticksOver(10, 144);

    expect(at144Hz).toBe(at60Hz);
    // 30 ticks per second for 10 seconds; 1000 / 30 isn't exact, so the last one may just miss.
    expect(at60Hz).toBeGreaterThanOrEqual(299);
    expect(at60Hz).toBeLessThanOrEqual(300);
  });

  it('catches up on at most a quarter of a second after a long pause, like a background tab', () => {
    const ticks = new FixedTicks(TICK_MS);
    ticks.ticksDue(0);

    const afterAMinute = ticks.ticksDue(60_000);

    // 250 ms of catch-up at 30 ticks per second, instead of the 1800 ticks a minute would need.
    expect(afterAMinute).toBe(7);
  });

  it('runs no ticks on the very first frame, as there is no earlier frame to measure from', () => {
    const ticks = new FixedTicks(TICK_MS);

    // requestAnimationFrame's time counts from page load, so the first frame is rarely at 0.
    const firstFrame = ticks.ticksDue(5_000);

    expect(firstFrame).toBe(0);
  });
});
