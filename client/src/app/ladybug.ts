import { Animation, animationNamed, duration, frameAt, randomEventGap } from './animation';

/** The lifted frames of the flap are drawn 1 px higher, as the atlas notes say. */
const LIFT_PX = 1;

/** What to draw for the ladybug this frame. */
export interface LadybugFrame {
  name: string;
  /** Up or down from its tile, in game pixels. */
  offsetY: number;
}

/**
 * A ladybug standing on one tile: its legs step in place, and now and then it opens its shell and
 * flaps its wings. Temporary, until the enemies walk around (E-steps); for now it shows the ticks
 * running.
 */
export class Ladybug {
  private flapStartTick: number | null = null;
  private nextFlapTick: number;
  private readonly walk: Animation;
  private readonly flap: Animation;

  constructor(
    readonly x: number,
    readonly y: number,
    animations: Record<string, Animation>,
    private readonly random: () => number = Math.random,
  ) {
    this.walk = animationNamed(animations, 'enemy_walk');
    this.flap = animationNamed(animations, 'enemy_flap');
    this.nextFlapTick = randomEventGap(this.flap, random);
  }

  /** Advances the ladybug to game tick `tick`: ends a finished flap and starts one that is due. */
  update(tick: number): void {
    if (this.flapStartTick !== null && tick - this.flapStartTick >= duration(this.flap)) {
      this.flapStartTick = null;
      this.nextFlapTick = tick + randomEventGap(this.flap, this.random);
    }
    if (this.flapStartTick === null && tick >= this.nextFlapTick) {
      this.flapStartTick = tick;
    }
  }

  frameAt(tick: number): LadybugFrame {
    if (this.flapStartTick === null) {
      return { name: frameAt(this.walk, tick), offsetY: 0 };
    }
    return { name: frameAt(this.flap, tick - this.flapStartTick), offsetY: -LIFT_PX };
  }
}
