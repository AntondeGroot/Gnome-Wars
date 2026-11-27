import { ArenaMap } from '../../arena-map';
import { Position } from './walls';

/** A gnome's full speed, out of 100. */
export const FULL_SPEED_PERCENT = 100;

/** The ground of an arena, as far as it changes how fast gnomes walk. */
export class Terrain {
  private constructor(
    private readonly grid: string[],
    private readonly speedPercentOn: Record<string, number>,
  ) {}

  static of(map: ArenaMap): Terrain {
    return new Terrain(map.grid, map.speedPercentOn ?? {});
  }

  /** The share of its speed a gnome keeps on `tile`, out of 100: less on sand. */
  speedPercentAt(tile: Position): number {
    const letter = [...(this.grid[tile.y] ?? '')][tile.x];
    return (letter === undefined ? undefined : this.speedPercentOn[letter]) ?? FULL_SPEED_PERCENT;
  }
}
