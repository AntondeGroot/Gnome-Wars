import { Direction } from '../direction';

/** The atlas draws four walk frames per direction: down_walk_0 to down_walk_3. */
const WALK_FRAMES = 4;
/**
 * Ticks each walk frame shows. At 1 unit per tick a full cycle of 4 frames covers 16 units, one
 * tile, so the feet keep pace with the ground.
 */
const TICKS_PER_WALK_FRAME = 4;

export class Gnome {
  private facing: Direction = 'down';
  private skin = 'red';
  /** Ticks moved in a row; 0 while standing still. Picks the walk frame. */
  private ticksWalking = 0;

  constructor(
    private _x: number,
    private _y: number,
  ) {}

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  move(direction: Direction): void {
    this.facing = direction;
    this.ticksWalking++;
    switch (direction) {
      case 'up':
        this._y--;
        break;
      case 'down':
        this._y++;
        break;
      case 'left':
        this._x--;
        break;
      case 'right':
        this._x++;
        break;
    }
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
