import { ArenaMap } from './arena-map';

/** A tile is 16 units wide and high; positions are in units. */
export const TILE_UNITS = 16;

/** A position in units: the top-left corner of a gnome's one-tile box. */
export interface Position {
  x: number;
  y: number;
}

/** Anything that can stand in a gnome's way, such as walls or pods. */
export interface Obstacles {
  /** Whether a one-tile box at `position` would run into it. */
  blocks(position: Position): boolean;
}

/** Which tiles of the arena block walking. */
export class Walls implements Obstacles {
  private constructor(private readonly solidRows: boolean[][]) {}

  /**
   * The walls of a map: every tile whose letter isn't walkable. Breakables aren't walls, as they
   * can be destroyed; Breakables blocks those tiles while they stand.
   */
  static of(map: ArenaMap): Walls {
    return Walls.allExcept(map.grid, [...map.walkable, ...(map.breakable ?? [])]);
  }

  /** What stops a blast: the same walls, except that blasts cross the map's blastsCross tiles. */
  static forBlasts(map: ArenaMap): Walls {
    const open = [...map.walkable, ...(map.blastsCross ?? []), ...(map.breakable ?? [])];
    return Walls.allExcept(map.grid, open);
  }

  /** Every tile is solid except those whose letter is in `openLetters`. */
  private static allExcept(grid: string[], openLetters: string[]): Walls {
    const open = new Set(openLetters);
    return new Walls(grid.map((row) => [...row].map((letter) => !open.has(letter))));
  }

  /** Whether a one-tile box at `position` overlaps a solid tile. Outside the arena counts as solid. */
  blocks(position: Position): boolean {
    return tilesUnder(position).some((tile) => this.isSolid(tile.x, tile.y));
  }

  private isSolid(column: number, row: number): boolean {
    return this.solidRows[row]?.[column] ?? true;
  }
}

/** The tiles a one-tile box at `position` overlaps: one to four, as it may sit between tiles. */
export function tilesUnder(position: Position): Position[] {
  const firstColumn = Math.floor(position.x / TILE_UNITS);
  const lastColumn = Math.floor((position.x + TILE_UNITS - 1) / TILE_UNITS);
  const firstRow = Math.floor(position.y / TILE_UNITS);
  const lastRow = Math.floor((position.y + TILE_UNITS - 1) / TILE_UNITS);
  const tiles: Position[] = [];
  for (let y = firstRow; y <= lastRow; y++) {
    for (let x = firstColumn; x <= lastColumn; x++) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

/** Obstacles that block wherever any of `obstacles` does. */
export function anyOf(...obstacles: Obstacles[]): Obstacles {
  return { blocks: (position) => obstacles.some((obstacle) => obstacle.blocks(position)) };
}

/** The tile a one-tile box at `position` mostly covers: halfway between two, the next one. */
export function nearestTile(position: Position): Position {
  return { x: Math.round(position.x / TILE_UNITS), y: Math.round(position.y / TILE_UNITS) };
}

export function sameTile(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}
