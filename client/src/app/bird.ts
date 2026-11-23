import { Animation, animationNamed, duration, frameAt, randomEventGap } from './animation';

/** The prop a bird sits on; every bird bath in the map gets one. */
export const BIRD_BATH = 'birdbath';

type Rim = 'left' | 'right';
type BirdEvent = 'bird_dip' | 'bird_hop';
const EVENTS: BirdEvent[] = ['bird_dip', 'bird_hop'];

/** What to draw for the bird this frame. */
export interface BirdFrame {
  name: string;
  /** Mirrored left to right: the hop and dip frames are drawn for the left rim. */
  flipX: boolean;
  /** Where to draw it relative to the bird bath's tile, in game pixels. */
  offset: [x: number, y: number];
}

/**
 * The bird on a bird bath. It perches on one rim and now and then dips its beak in the water or
 * hops to the other rim. It is only decoration, so the random moments don't have to match between
 * players, and Math.random is fine.
 */
export class Bird {
  private rim: Rim = 'left';
  private playing: { event: BirdEvent; startTick: number } | null = null;
  private readonly nextEventTick: Record<BirdEvent, number>;
  private readonly offset: [number, number];

  constructor(
    readonly x: number,
    readonly y: number,
    private readonly animations: Record<string, Animation>,
    private readonly random: () => number = Math.random,
  ) {
    this.nextEventTick = {
      bird_dip: this.randomGap('bird_dip'),
      bird_hop: this.randomGap('bird_hop'),
    };
    this.offset = animationNamed(animations, 'bird_perch').draw_offset_px ?? [0, 0];
  }

  /** Advances the bird to game tick `tick`: ends a finished event and starts one that is due. */
  update(tick: number): void {
    if (this.playing !== null) {
      const { event, startTick } = this.playing;
      if (tick - startTick < duration(animationNamed(this.animations, event))) {
        return;
      }
      this.finish(event, tick);
    }
    const due = EVENTS.find((event) => tick >= this.nextEventTick[event]);
    if (due !== undefined) {
      this.playing = { event: due, startTick: tick };
    }
  }

  frameAt(tick: number): BirdFrame {
    if (this.playing === null) {
      return { name: `bird_perch_${this.rim}`, flipX: false, offset: this.offset };
    }
    const { event, startTick } = this.playing;
    const name = frameAt(animationNamed(this.animations, event), tick - startTick);
    // A hop from the right rim is the left-to-right hop mirrored; a dip there faces the other way.
    return { name, flipX: this.rim === 'right', offset: this.offset };
  }

  private finish(event: BirdEvent, tick: number): void {
    if (event === 'bird_hop') {
      this.rim = this.rim === 'left' ? 'right' : 'left';
    }
    this.nextEventTick[event] = tick + this.randomGap(event);
    this.playing = null;
  }

  private randomGap(event: BirdEvent): number {
    return randomEventGap(animationNamed(this.animations, event), this.random);
  }
}
