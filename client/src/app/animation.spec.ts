import { Animation, frameAt } from './animation';

describe('frameAt', () => {
  it('holds each frame for its own number of ticks and switches exactly at the boundary', () => {
    // 'open' lasts 3 ticks (its own length), 'shut' 5 (the default): together 8 ticks.
    const blink: Animation = { frames: [['open', 3], 'shut'], ticks_per_frame: 5 };

    expect(frameAt(blink, 0)).toBe('open');
    expect(frameAt(blink, 2)).toBe('open');
    expect(frameAt(blink, 3)).toBe('shut');
    expect(frameAt(blink, 7)).toBe('shut');
    expect(frameAt(blink, 8)).toBe('open'); // starts over
  });

  it('counts back from the end for a negative tick, as a tile that starts late asks for one', () => {
    // A tile 3 ticks late asks for tick -3 at game tick 0. 8 ticks long: -1 is tick 7, -6 is tick 2.
    const blink: Animation = { frames: [['open', 3], 'shut'], ticks_per_frame: 5 };

    expect(frameAt(blink, -1)).toBe('shut');
    expect(frameAt(blink, -6)).toBe('open');
  });
});
