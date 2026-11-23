import { animatedTileFrame, splitAnimated } from './animated-tiles';
import { Animation } from './animation';
import { PlacedProp } from './arena-map';

/**
 * Half of the 8 directions: right, below, and the two diagonals on the right. Checked from every
 * tile, they compare each pair of neighbours once; the other half would repeat the same pairs.
 */
const LATER_NEIGHBOURS: [dx: number, dy: number][] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

describe('animated tiles', () => {
  it('never shows a pond tile in the same glint frame as any of its 8 neighbours', () => {
    const animations: Record<string, Animation> = {
      pond_glint: {
        applies_to: ['water'],
        frames: ['{piece}', '{piece}_f1', '{piece}_f2', '{piece}_f3'],
        ticks_per_frame: 18,
        loop: true,
      },
    };
    // A 4 × 4 pond of identical pieces, so equal frame names mean the tiles glint in step.
    const pond: PlacedProp[] = [];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        pond.push({ x, y, frame: 'water' });
      }
    }
    const { animatedTiles } = splitAnimated(pond, animations);
    const frameAt = new Map(
      animatedTiles.map((tile) => [`${tile.x},${tile.y}`, animatedTileFrame(tile, 0)]),
    );

    const inStep: string[] = [];
    for (const { x, y } of pond) {
      for (const [dx, dy] of LATER_NEIGHBOURS) {
        const neighbour = frameAt.get(`${x + dx},${y + dy}`);
        if (neighbour === frameAt.get(`${x},${y}`)) {
          inStep.push(`(${x},${y}) and (${x + dx},${y + dy})`);
        }
      }
    }

    expect(inStep).toEqual([]);
  });
});
