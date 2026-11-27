// Imported at build time rather than fetched: the map lives in shared/ (the server reads the same
// file), outside the Angular workspace, so it can't be served as an asset. The import also lets
// TypeScript check the file against ArenaMap.
import backyard from '../../../shared/maps/backyard.json';

export interface ArenaMap {
  grid: string[];
  legend: Record<string, string | null>;
  /** The letters a gnome can walk on; every other letter is solid. */
  walkable: string[];
  /** Letters a blast crosses although gnomes can't walk on them, such as the pond. Optional. */
  blastsCross?: string[];
  /**
   * Letters of props a blast destroys, such as hedges and pots. They block walking and blasts
   * until then; see Breakables. Optional.
   */
  breakable?: string[];
  /**
   * Letters that slow gnomes down, with the share of their speed they keep there, out of 100:
   * 50 on sand. Letters not in it are walked at full speed. Optional.
   */
  speedPercentOn?: Record<string, number>;
  /** Breakables scattered at match start, by the match's seeded random; see scatterBreakables. */
  scatter?: Scatter;
}

/** Which breakables may be scattered where, and how many. */
export interface Scatter {
  /** The share of the allowed tiles that get one, out of 100. */
  percent: number;
  /** For each letter they may stand on, the frames of the breakables to pick from. */
  on: Record<string, string[]>;
}

export const BACKYARD: ArenaMap = backyard;
