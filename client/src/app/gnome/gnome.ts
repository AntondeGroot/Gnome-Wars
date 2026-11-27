import { Direction } from '../game/rules/direction';
import { FULL_SPEED_PERCENT } from '../game/rules/terrain';
import { anyOf, Obstacles } from '../game/rules/walls';
import { GnomeStats } from '../game/rules/gnome-stats';
import { Lives } from './lives';
import { stepToward } from '../game/rules/step';

/** The game's ticks per second; a gnome's speed is in units per second. */
const TICKS_PER_SECOND = 30;
/** Nothing in the way besides the walls. */
const NO_OBSTACLES: Obstacles = { blocks: () => false };

export class Gnome {
  /** How many pods it may have out, how far they blast and how fast it walks. */
  readonly stats = new GnomeStats();
  readonly lives = new Lives();
  private _facing: Direction = 'down';
  private _unitsWalked = 0;
  /** Speed left over from earlier ticks, in units × ticks per second × 100; see unitsThisTick. */
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

  /** The way it last moved or turned; it stays that way while standing. */
  get facing(): Direction {
    return this._facing;
  }

  /** Units moved in a row; 0 while standing still. The drawing picks the walk frame from it. */
  get unitsWalked(): number {
    return this._unitsWalked;
  }

  /**
   * One tick of walking towards `direction`: as many units as its speed gives this tick, each one a
   * step or a nudge round a corner; see stepToward. Against a wall, or one of the `obstacles` such
   * as pods, it stops there, turned that way. Out, it stays put. On slow ground it keeps only
   * `speedPercent` of its speed.
   */
  move(
    direction: Direction,
    obstacles: Obstacles = NO_OBSTACLES,
    speedPercent = FULL_SPEED_PERCENT,
  ): void {
    if (this.lives.isOut) {
      return;
    }
    this._facing = direction;
    const inTheWay = anyOf(this.walls, obstacles);
    const units = this.unitsThisTick(speedPercent);
    for (let unit = 0; unit < units; unit++) {
      if (!this.stepOneUnit(direction, inTheWay)) {
        this.stop();
        return;
      }
    }
  }

  /** A tick without moving: the gnome stands idle, still facing the way it last moved. */
  stop(): void {
    this._unitsWalked = 0;
    this.speedLeft = 0;
  }

  /**
   * Whole units to walk this tick: unitsPerSecond / 30, times speedPercent / 100, with the rest
   * kept for later ticks. At 40 that is 1, 1, 2, 1, 1, 2, …: 40 units a second; on sand at 50% it
   * is 0, 1, 1, 0, 1, 1, …. All whole numbers, so the server gets the same.
   */
  private unitsThisTick(speedPercent: number): number {
    this.speedLeft += this.stats.unitsPerSecond * speedPercent;
    const perUnit = TICKS_PER_SECOND * FULL_SPEED_PERCENT;
    const units = Math.floor(this.speedLeft / perUnit);
    this.speedLeft -= units * perUnit;
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
    this._unitsWalked++;
    return true;
  }
}
