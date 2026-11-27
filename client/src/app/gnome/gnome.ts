import { Direction } from '../direction';
import { anyOf, Obstacles } from '../walls';
import { GnomeStats } from './gnome-stats';
import { stepToward } from './step';

/** The atlas draws four walk frames per direction: down_walk_0 to down_walk_3. */
const WALK_FRAMES = 4;
/**
 * Ticks each walk frame shows. At 1 unit per tick a full cycle of 4 frames covers 16 units, one
 * tile, so the feet keep pace with the ground.
 */
const TICKS_PER_WALK_FRAME = 4;
/** Nothing in the way besides the walls. */
const NO_OBSTACLES: Obstacles = { blocks: () => false };

export class Gnome {
  /** How many pods it may have out, how far they blast and how fast it walks. */
  readonly stats = new GnomeStats();
  private facing: Direction = 'down';
  /** Ticks moved in a row; 0 while standing still. Picks the walk frame. */
  private ticksWalking = 0;

  constructor(
    private _x: number,
    private _y: number,
    /** What it can never walk through, such as walls. */
    private readonly walls: Obstacles,
    /** The name of its skin in the skin sheet, such as "blue"; it starts every frame name. */
    private readonly skin = 'red',
  ) {}

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  /**
   * One unit towards `direction`, or a nudge round a corner; see stepToward. Against a wall, or one
   * of the `obstacles` such as pods, it only turns that way and stands idle.
   */
  move(direction: Direction, obstacles: Obstacles = NO_OBSTACLES): void {
    this.facing = direction;
    const next = stepToward({ x: this._x, y: this._y }, direction, anyOf(this.walls, obstacles));
    if (next === null) {
      this.stop();
      return;
    }
    this._x = next.x;
    this._y = next.y;
    this.ticksWalking++;
  }

  /** A tick without moving: the gnome stands idle, still facing the way it last moved. */
  stop(): void {
    this.ticksWalking = 0;
  }

  get frameName(): string {
    return `${this.skin}/${this.facing}_${this.pose()}`;
  }

  /** "idle", or the walk frame for this tick: walk_0 from the first step, then on every few ticks. */
  private pose(): string {
    if (this.ticksWalking === 0) {
      return 'idle';
    }
    const walkFrame = Math.floor((this.ticksWalking - 1) / TICKS_PER_WALK_FRAME) % WALK_FRAMES;
    return `walk_${walkFrame}`;
  }
}
