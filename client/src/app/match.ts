import { ArenaMap } from './arena-map';
import { Breakables } from './breakables';
import { Direction } from './direction';
import { Gnome } from './gnome/gnome';
import { hitGnomesInBlasts } from './pods/knock-outs';
import { PodsOnLawn } from './pods/pods-on-lawn';
import { PowerUps } from './power-ups/power-ups';
import { scatterBreakables } from './scatter-breakables';
import { RandomInts } from './seeded-random';
import { Terrain } from './terrain';
import { anyOf, nearestTile, Position, TILE_UNITS, Walls } from './walls';

/** Where a gnome starts, and its skin. */
export interface GnomeStart {
  tile: Position;
  skin: string;
}

/**
 * One match in an arena: the gnomes, breakables, pods and power-ups, moved on one tick at a time.
 * Plain rules without a canvas, so they are testable and the server can copy them.
 */
export class Match {
  readonly breakables: Breakables;
  /** The player first, then the others. */
  readonly gnomes: Gnome[];
  readonly pods: PodsOnLawn;
  readonly powerUps: PowerUps;
  private readonly terrain: Terrain;

  /**
   * @param random seeded at match start; decides everything random, such as where breakables are
   * scattered and which power-ups drop
   */
  constructor(map: ArenaMap, starts: GnomeStart[], random: RandomInts) {
    const scattered = scatterBreakables(
      map,
      random,
      starts.map(({ tile }) => tile),
    );
    this.breakables = Breakables.from([...Breakables.of(map).all, ...scattered]);
    const walls = anyOf(Walls.of(map), this.breakables);
    // A gnome moves in units, not whole tiles, so it keeps its position in units.
    this.gnomes = starts.map(
      ({ tile, skin }) => new Gnome(tile.x * TILE_UNITS, tile.y * TILE_UNITS, walls, skin),
    );
    this.pods = new PodsOnLawn(Walls.forBlasts(map), this.breakables);
    this.powerUps = new PowerUps(random);
    this.terrain = Terrain.of(map);
  }

  /** The gnome the keys steer. */
  get player(): Gnome {
    return this.gnomes[0];
  }

  /**
   * One tick of the rules: the player walks or stands, the pods burst and destroy the power-ups
   * they cover, destroyed breakables drop new ones, gnomes take what they stand on, then who got
   * hit. Dropping after destroying lets a dropped power-up survive the blast that broke its hedge.
   */
  tick(direction: Direction | null, plantHeld: boolean, tick: number): void {
    if (direction === null) {
      this.player.stop();
    } else {
      const speedPercent = this.terrain.speedPercentAt(nearestTile(this.player));
      this.player.move(direction, this.pods.obstaclesFor(this.player), speedPercent);
    }
    this.pods.update(this.player, plantHeld, tick);
    this.powerUps.destroyUnder(this.pods.burstThisTick);
    this.powerUps.dropAt(this.pods.destroyedThisTick);
    this.powerUps.pickUp(this.gnomes);
    hitGnomesInBlasts(this.gnomes, this.pods.allBlasts, tick);
  }
}
