// Imported at build time rather than fetched: the map and tiles live in shared/ (the server reads
// the same files), outside the Angular workspace, so they can't be served as assets. The import
// also lets TypeScript check the files against ArenaMap and Tiles.
import backyard from '../../../shared/maps/backyard.json';
import summer from '../../../shared/tiles/summer.json';

/** A map played with a set of tiles: where everything is, and what each letter stands for. */
export interface ArenaMap {
  grid: string[];
  /** What each letter in the grid stands for; a letter without an entry is solid ground. */
  tiles: Tiles;
  /** Breakables scattered at match start, by the match's seeded random; see scatterBreakables. */
  scatter?: Scatter;
}

/**
 * What every letter stands for, the same for every map: a season can give a letter another look
 * and other rules, such as a pond that freezes over.
 */
export type Tiles = Record<string, Tile>;

/** What a letter is drawn as, and how gnomes and blasts treat it. Each part is optional. */
export interface Tile {
  /** The atlas frame or multi-tile piece drawn on it; none for plain ground such as grass. */
  frame?: string;
  /** Gnomes can walk on it; without this it is solid. */
  walkable?: boolean;
  /** Blasts cross it although gnomes can't walk on it, such as the pond. */
  blastsCross?: boolean;
  /**
   * A prop a blast destroys, such as a hedge in a test map. It blocks walking and blasts until
   * then; see Breakables.
   */
  breakable?: boolean;
  /** The share of their speed gnomes keep on it, out of 100: 50 on sand. Full speed without it. */
  speedPercent?: number;
}

/**
 * Which breakables may be scattered where, and how often: for each letter they may stand on, the
 * frame of each breakable with the share of those tiles it gets, out of 100. A tile's letter adds
 * up to 100 or less; the rest of its tiles stay empty. `{ '.': { hedge: 30, flower_pot: 15 } }`
 * puts a hedge on 30% of the grass, a pot on 15%, and nothing on the other 55%.
 */
export type Scatter = Record<string, Record<string, number>>;

/** The backyard in summer. */
export const BACKYARD: ArenaMap = { ...backyard, tiles: summer };

/** The letters of `tiles` for which `has` holds, such as every walkable one. */
export function lettersWhere(tiles: Tiles, has: (tile: Tile) => boolean): string[] {
  return Object.entries(tiles).flatMap(([letter, tile]) => (has(tile) ? [letter] : []));
}
