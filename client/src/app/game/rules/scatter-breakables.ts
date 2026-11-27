import { ArenaMap } from '../../arena-map';
import { Breakable } from './breakables';
import { RandomInts } from './seeded-random';
import { Position } from './walls';

const PERCENT = 100;
/** Start tiles are the letters 1 to 8, one per player. */
const START_LETTERS = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);

/**
 * Breakables scattered over the map's allowed tiles, row by row from the top, so every client with
 * the same seed gets the same layout. Each allowed tile gets one `percent` of the time, picked from
 * the breakables its letter allows. Nothing goes on or next to a start tile, or a tile in
 * `keepClear`, so every gnome can move and plant at the start.
 */
export function scatterBreakables(
  map: ArenaMap,
  random: RandomInts,
  keepClear: readonly Position[] = [],
): Breakable[] {
  const scatter = map.scatter;
  if (scatter === undefined) {
    return [];
  }
  const clear = [...startTilesIn(map), ...keepClear];
  return map.grid.flatMap((row, y) =>
    [...row].flatMap((letter, x) => {
      const frames = scatter.on[letter];
      const tile = { x, y };
      if (frames === undefined || isOnOrNextTo(tile, clear)) {
        return [];
      }
      if (random.nextInt(PERCENT) >= scatter.percent) {
        return [];
      }
      return [{ tile, frame: frames[random.nextInt(frames.length)] }];
    }),
  );
}

/** The tiles whose letter is a start tile, 1 to 8. */
function startTilesIn(map: ArenaMap): Position[] {
  return map.grid.flatMap((row, y) =>
    [...row].flatMap((letter, x) => (START_LETTERS.has(letter) ? [{ x, y }] : [])),
  );
}

/** Whether `tile` is one of `tiles` or right next to one, up, down, left or right. */
function isOnOrNextTo(tile: Position, tiles: readonly Position[]): boolean {
  return tiles.some((other) => Math.abs(tile.x - other.x) + Math.abs(tile.y - other.y) <= 1);
}
