import { cameraPosition, viewSize } from './camera';

/** The backyard: 17 × 13 tiles of 16 game pixels. */
const ARENA = { width: 272, height: 208 };
/** What a phone held sideways shows at 3 CSS pixels per game pixel: about 390 × 260 CSS pixels. */
const PHONE_VIEW = { width: 130, height: 86 };

describe('cameraPosition', () => {
  it('stops at the right and bottom edges, so the view never shows past the fence', () => {
    // The centre of a gnome on the bottom-right start tile (15, 11). Centring on it would start
    // the view at (183, 141) and show 41 × 19 pixels beyond the arena.
    const focus = { x: 248, y: 184 };

    expect(cameraPosition(focus, PHONE_VIEW, ARENA)).toEqual({ x: 272 - 130, y: 208 - 86 });
  });

  it('centres the view on the gnome when it is away from the edges', () => {
    // The middle of the arena: the view starts half a view (65 × 43) up and to the left of it.
    const focus = { x: 136, y: 104 };

    expect(cameraPosition(focus, PHONE_VIEW, ARENA)).toEqual({ x: 136 - 65, y: 104 - 43 });
  });

  it('stops at the left and top edges, so the view never starts before the fence', () => {
    // The centre of a gnome on the top-left start tile (1, 1). Centring on it would start the view
    // at (-41, -19).
    const focus = { x: 24, y: 24 };

    expect(cameraPosition(focus, PHONE_VIEW, ARENA)).toEqual({ x: 0, y: 0 });
  });

  it('shows the whole arena, wherever the gnome is, when the screen is big enough', () => {
    // viewSize never makes the view bigger than the arena, so on a big screen they are the same.
    // The gnome stands in the bottom-right corner, where a smaller view would follow it.
    const focus = { x: 248, y: 184 };

    expect(cameraPosition(focus, ARENA, ARENA)).toEqual({ x: 0, y: 0 });
  });
});

describe('viewSize', () => {
  it('shows as much of the arena as fits, and never more than the arena, per side', () => {
    // A wide but low window: wider than the arena, yet only 86 game pixels high.
    const screen = { width: 400, height: 86 };

    expect(viewSize(screen, ARENA)).toEqual({ width: 272, height: 86 });
  });
});
