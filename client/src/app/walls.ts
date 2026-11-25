import { ArenaMap } from './arena-map';

/** A tile is 16 units wide and high; positions are in units. */
export const TILE_UNITS = 16;

/** A position in units: the top-left corner of a gnome's one-tile box. */
export interface Position {
  x: number;
  y: number;
}

/** Which tiles of the arena block walking. */
export class Walls {
  private constructor(private readonly solidRows: boolean[][]) {}

  /** The walls of a map: every tile whose letter isn't in its walkable list. */
  static of(map: ArenaMap): Walls {
    const walkable = new Set(map.walkable);
    return new Walls(map.grid.map((row) => [...row].map((letter) => !walkable.has(letter))));
  }

  /** Whether a one-tile box at `position` overlaps a solid tile. Outside the arena counts as solid. */
  blocks(position: Position): boolean {
    const firstColumn = Math.floor(position.x / TILE_UNITS);
    const lastColumn = Math.floor((position.x + TILE_UNITS - 1) / TILE_UNITS);
    const firstRow = Math.floor(position.y / TILE_UNITS);
    const lastRow = Math.floor((position.y + TILE_UNITS - 1) / TILE_UNITS);
    for (let row = firstRow; row <= lastRow; row++) {
      for (let column = firstColumn; column <= lastColumn; column++) {
        if (this.isSolid(column, row)) {
          return true;
        }
      }
    }
    return false;
  }

  private isSolid(column: number, row: number): boolean {
    return this.solidRows[row]?.[column] ?? true;
  }
}
