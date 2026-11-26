import { Walls } from '../walls';
import { blastCells } from './blast-cells';

/**
 * A 5 × 5 lawn with a pod's tile at (2, 2): a wall two tiles up, at (2, 0), and one right next to
 * it on the left, at (1, 2).
 */
const WALLED_LAWN = Walls.of({
  grid: ['..#..', '.....', '.#...', '.....', '.....'],
  legend: {},
  walkable: ['.'],
});
const POD_TILE = { x: 2, y: 2 };

/** A 7 × 7 lawn without walls: from its centre a range of 2 stops a tile short of every edge. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(7).fill('.......'),
  legend: {},
  walkable: ['.'],
});
const OPEN_LAWN_CENTRE = { x: 3, y: 3 };

describe('blastCells', () => {
  it('stops an arm before the first wall, so a wall next to the centre leaves no arm', () => {
    const cells = blastCells(POD_TILE, 2, WALLED_LAWN);

    expect(cells.filter((cell) => cell.direction === 'up')).toEqual([
      { tile: { x: 2, y: 1 }, part: 'end', direction: 'up' },
    ]);
    expect(cells.filter((cell) => cell.direction === 'left')).toEqual([]);
  });

  it('grows an arm of range tiles in each direction, each ending in a leafy end', () => {
    const cells = blastCells(OPEN_LAWN_CENTRE, 2, OPEN_LAWN);

    expect(cells).toHaveLength(9);
    expect(cells).toEqual(
      expect.arrayContaining([
        { tile: { x: 3, y: 3 }, part: 'center' },
        { tile: { x: 3, y: 2 }, part: 'arm', direction: 'up' },
        { tile: { x: 3, y: 1 }, part: 'end', direction: 'up' },
        { tile: { x: 3, y: 4 }, part: 'arm', direction: 'down' },
        { tile: { x: 3, y: 5 }, part: 'end', direction: 'down' },
        { tile: { x: 2, y: 3 }, part: 'arm', direction: 'left' },
        { tile: { x: 1, y: 3 }, part: 'end', direction: 'left' },
        { tile: { x: 4, y: 3 }, part: 'arm', direction: 'right' },
        { tile: { x: 5, y: 3 }, part: 'end', direction: 'right' },
      ]),
    );
  });
});
