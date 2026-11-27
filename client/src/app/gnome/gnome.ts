import { Direction } from '../direction';
import { anyOf, Obstacles } from '../walls';
import { GnomeStats } from './gnome-stats';
import { Lives } from './lives';
import { stepToward } from './step';

/** The atlas draws four walk frames per direction: down_walk_0 to down_walk_3. */
const WALK_FRAMES = 4;
/**
 * Units walked per walk frame: a full cycle of 4 frames covers 16 units, one tile, so the feet keep
 * pace with the ground at any speed.
 */
const UNITS_PER_WALK_FRAME = 4;
/** The game's ticks per second; a gnome's speed is in units per second. */
const TICKS_PER_SECOND = 30;
/** Nothing in the way besides the walls. */
const NO_OBSTACLES: Obstacles = { blocks: () => false };

export class Gnome {
  /** How many pods it may have out, how far they blast and how fast it walks. */
  readonly stats = new GnomeStats();
  readonly lives = new Lives();
  private facing: Direction = 'down';
  /** Units moved in a row; 0 while standing still. Picks the walk frame. */
  private unitsWalked = 0;
  /** Speed left over from earlier ticks, in units × ticks per second; see unitsThisTick. */
  private speedLeft = 0;

  constructor(
    private _x: number,
    private _y: number,
    /** What it can never walk through, such as walls. */
    private readonly walls: Obstacles,
    /** The name of its skin in the skin sheet, such as "blue"; it starts every frame name. */
    readonly skin = 'red',
  ) {}

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  /**
   * One tick of walking towards `direction`: as many units as its speed gives this tick, each one a
   * step or a nudge round a corner; see stepToward. Against a wall, or one of the `obstacles` such
   * as pods, it stops there, turned that way. Out, it stays put.
   */
  move(direction: Direction, obstacles: Obstacles = NO_OBSTACLES): void {
    if (this.lives.isOut) {
      return;
    }
    this.facing = direction;
    const inTheWay = anyOf(this.walls, obstacles);
    const units = this.unitsThisTick();
    for (let unit = 0; unit < units; unit++) {
      if (!this.stepOneUnit(direction, inTheWay)) {
        this.stop();
        return;
      }
    }
  }

  /** A tick without moving: the gnome stands idle, still facing the way it last moved. */
  stop(): void {
    this.unitsWalked = 0;
    this.speedLeft = 0;
  }

  /**
   * Whole units to walk this tick: unitsPerSecond / 30, with the rest kept for later ticks. At 40
   * that is 1, 1, 2, 1, 1, 2, …: 40 units a second, all whole, so the server gets the same.
   */
  private unitsThisTick(): number {
    this.speedLeft += this.stats.unitsPerSecond;
    const units = Math.floor(this.speedLeft / TICKS_PER_SECOND);
    this.speedLeft -= units * TICKS_PER_SECOND;
    return units;
  }

  /** One unit, or a nudge; false when something is in the way. */
  private stepOneUnit(direction: Direction, inTheWay: Obstacles): boolean {
    const next = stepToward({ x: this._x, y: this._y }, direction, inTheWay);
    if (next === null) {
      return false;
    }
    this._x = next.x;
    this._y = next.y;
    this.unitsWalked++;
    return true;
  }

  get frameName(): string {
    return `${this.skin}/${this.facing}_${this.pose()}`;
  }

  /** "idle", or the walk frame: walk_0 from the first unit, then the next every 4 units walked. */
  private pose(): string {
    if (this.unitsWalked === 0) {
      return 'idle';
    }
    const walkFrame = Math.floor((this.unitsWalked - 1) / UNITS_PER_WALK_FRAME) % WALK_FRAMES;
    return `walk_${walkFrame}`;
  }
}
