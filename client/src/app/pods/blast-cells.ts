import { Direction } from '../direction';
import { Position, TILE_UNITS, Walls } from '../walls';

/** Which piece of the vine a cell shows: the centre, a straight arm, or the leafy end of an arm. */
export type BlastPart = 'center' | 'arm' | 'end';

/** One tile a blast covers. Arms and ends have the direction they grow in; the centre has none. */
export interface BlastCell {
  readonly tile: Position;
  readonly part: BlastPart;
  readonly direction?: Direction;
}

/** One tile further in each direction. */
const TILE_STEPS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const DIRECTIONS = Object.keys(TILE_STEPS) as Direction[];

/**
 * The tiles a blast from `centre` covers: the centre, then an arm in each direction of up to `range`
 * tiles. An arm stops before the first wall, and its last tile is its leafy end.
 */
export function blastCells(centre: Position, range: number, walls: Walls): BlastCell[] {
  const arms = DIRECTIONS.flatMap((direction) => armCells(centre, direction, range, walls));
  return [{ tile: centre, part: 'center' }, ...arms];
}

function armCells(
  centre: Position,
  direction: Direction,
  range: number,
  walls: Walls,
): BlastCell[] {
  const reach = reachOf(centre, direction, range, walls);
  return Array.from({ length: reach }, (_, index) => ({
    tile: tilesAway(centre, direction, index + 1),
    part: index === reach - 1 ? 'end' : 'arm',
    direction,
  }));
}

/** How many tiles an arm grows: up to `range`, stopping before the first wall. */
function reachOf(centre: Position, direction: Direction, range: number, walls: Walls): number {
  let reach = 0;
  while (reach < range && !isWall(tilesAway(centre, direction, reach + 1), walls)) {
    reach++;
  }
  return reach;
}

function tilesAway(from: Position, direction: Direction, tiles: number): Position {
  const step = TILE_STEPS[direction];
  return { x: from.x + step.x * tiles, y: from.y + step.y * tiles };
}

function isWall(tile: Position, walls: Walls): boolean {
  return walls.blocks({ x: tile.x * TILE_UNITS, y: tile.y * TILE_UNITS });
}
