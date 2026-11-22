// Imported at build time rather than fetched: the map lives in shared/ (the server reads the same
// file), outside the Angular workspace, so it can't be served as an asset. The import also lets
// TypeScript check the file against ArenaMap.
import backyard from '../../../shared/maps/backyard.json';

export interface ArenaMap {
  grid: string[];
  legend: Record<string, string | null>;
}

export const BACKYARD: ArenaMap = backyard;
