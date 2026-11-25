// Imported at build time rather than fetched: the map lives in shared/ (the server reads the same
// file), outside the Angular workspace, so it can't be served as an asset. The import also lets
// TypeScript check the file against ArenaMap.
import backyard from '../../../shared/maps/backyard.json';
import { autotileFrame, isAutotile } from './autotile';

export interface ArenaMap {
  grid: string[];
  legend: Record<string, string | null>;
  /** The letters a gnome can walk on; every other letter is solid. */
  walkable: string[];
}

export const BACKYARD: ArenaMap = backyard;

/** A prop on the map: the frame to draw at tile (x, y), with autotiles already resolved. */
export interface PlacedProp {
  x: number;
  y: number;
  frame: string;
}

/**
 * Every prop in the map, row by row from the top, so taller props overlap the row behind.
 * The map's rows and letters are checked by arena-map.spec.ts, so this can trust them.
 */
export function propsIn(map: ArenaMap): PlacedProp[] {
  const props: PlacedProp[] = [];
  for (const [y, row] of map.grid.entries()) {
    for (const [x, letter] of [...row].entries()) {
      const name = map.legend[letter];
      if (name === null) continue;

      const frame = isAutotile(name) ? autotileFrame(name, map.grid, x, y) : name;
      props.push({ x, y, frame });
    }
  }
  return props;
}
