import { ArenaMap } from './arena-map';
import { autotileFrame, isAutotile } from './autotile';

/** A prop on the map: the frame to draw at tile (x, y), with autotiles already resolved. */
export interface PlacedProp {
  x: number;
  y: number;
  frame: string;
}

/**
 * Every prop in the map that never changes, row by row from the top, so taller props overlap the
 * row behind. Breakable letters are left out: Breakables draws those, as blasts destroy them.
 * The map's rows and letters are checked by arena-map.spec.ts, so this can trust them.
 */
export function propsIn(map: ArenaMap): PlacedProp[] {
  const breakable = new Set(map.breakable ?? []);
  const props: PlacedProp[] = [];
  for (const [y, row] of map.grid.entries()) {
    for (const [x, letter] of [...row].entries()) {
      const name = map.legend[letter];
      if (name === null || breakable.has(letter)) continue;

      const frame = isAutotile(name) ? autotileFrame(name, map.grid, x, y) : name;
      props.push({ x, y, frame });
    }
  }
  return props;
}
