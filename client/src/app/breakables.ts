import { ArenaMap } from './arena-map';
import { Obstacles, Position, tilesUnder } from './walls';

/** A hedge, pot or sandcastle still standing: its tile and the atlas frame it is drawn with. */
export interface Breakable {
  readonly tile: Position;
  readonly frame: string;
}

/** The breakables still standing. They block walking and blasts until a blast destroys them. */
export class Breakables implements Obstacles {
  /** By tile, as "x,y". */
  private readonly standing = new Map<string, Breakable>();

  private constructor(breakables: Breakable[]) {
    for (const breakable of breakables) {
      this.standing.set(keyOf(breakable.tile), breakable);
    }
  }

  /** Exactly these breakables. */
  static from(breakables: Breakable[]): Breakables {
    return new Breakables(breakables);
  }

  /** Every tile whose letter is in the map's breakable list. */
  static of(map: ArenaMap): Breakables {
    const breakable = new Set(map.breakable ?? []);
    const found = map.grid.flatMap((row, y) =>
      [...row].flatMap((letter, x) =>
        breakable.has(letter) ? [{ tile: { x, y }, frame: map.legend[letter] ?? letter }] : [],
      ),
    );
    return new Breakables(found);
  }

  /** No breakables at all, such as on an open test lawn. */
  static none(): Breakables {
    return new Breakables([]);
  }

  get all(): Breakable[] {
    return [...this.standing.values()];
  }

  has(tile: Position): boolean {
    return this.standing.has(keyOf(tile));
  }

  /** Destroys the breakable on `tile`; false when there was none. */
  destroy(tile: Position): boolean {
    return this.standing.delete(keyOf(tile));
  }

  blocks(position: Position): boolean {
    return tilesUnder(position).some((tile) => this.has(tile));
  }
}

function keyOf(tile: Position): string {
  return `${tile.x},${tile.y}`;
}
