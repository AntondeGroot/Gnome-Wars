import { Walls } from './walls';
import { stepToward } from './step';

/** Walls from rows of tiles, where '#' is solid and '.' is open. */
function wallsFrom(...rows: string[]): Walls {
  return Walls.of({ grid: rows, legend: {}, walkable: ['.'] });
}

describe('stepToward', () => {
  it('nudges a gnome that is slightly off-centre sideways towards the opening ahead', () => {
    // The opening is column 1 of the top row (x 16 to 31). The gnome stands in the row below at
    // x 19, 3 units right of it, so its box also covers the wall in column 2.
    const walls = wallsFrom(
      '#.#', //
      '...',
    );

    expect(stepToward({ x: 19, y: 16 }, 'up', walls)).toEqual({ x: 18, y: 16 });
  });

  it('nudges the other way when the gnome is off-centre on the other side of the opening', () => {
    // The same opening, with the gnome at x 13: 3 units left of it, over the wall in column 0.
    const walls = wallsFrom(
      '#.#', //
      '...',
    );

    expect(stepToward({ x: 13, y: 16 }, 'up', walls)).toEqual({ x: 14, y: 16 });
  });

  it('stops a gnome that walks straight into a wall it is lined up with', () => {
    // The gnome stands exactly below the wall in column 2, so there is no opening to slip into.
    const walls = wallsFrom(
      '#.#', //
      '...',
    );

    expect(stepToward({ x: 32, y: 16 }, 'up', walls)).toBeNull();
  });

  it('stops a gnome that is mostly in front of a wall, even with an opening further along', () => {
    // At x 19 the gnome is 3 units into column 1, a wall; the opening in column 2 is 13 units
    // away, too far to count as slightly off-centre.
    const walls = wallsFrom(
      '##.', //
      '...',
    );

    expect(stepToward({ x: 19, y: 16 }, 'up', walls)).toBeNull();
  });
});
