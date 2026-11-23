/** One step of an animation: a frame name lasting the animation's ticks_per_frame, or [name, ticks]. */
export type FrameEntry = string | [name: string, ticks: number];

/** An entry of the atlas's "animations" section. All times are in game ticks (30 per second). */
export interface Animation {
  frames: FrameEntry[];
  ticks_per_frame?: number;
  loop?: boolean;
  /** The frame names this animation is used for; "{piece}" in its frames stands for that name. */
  applies_to?: string[];
  /**
   * Marks an event: it plays once, a random number of ticks in the every_ticks range after it last
   * played. The atlas writes the range either inside "event" or next to it.
   */
  event?: true | { every_ticks: [number, number] };
  every_ticks?: [number, number];
  /** Where to draw it relative to its tile, in game pixels. */
  draw_offset_px?: [number, number];
}

/** The animation called `name`; throws for a name the atlas doesn't have, like drawFrame does. */
export function animationNamed(animations: Record<string, Animation>, name: string): Animation {
  const animation = animations[name];
  if (animation === undefined) {
    throw new Error(`Unknown animation: ${name}`);
  }
  return animation;
}

/** How many ticks the animation takes to play once. */
export function duration(animation: Animation): number {
  return animation.frames.reduce((total, entry) => total + entryTicks(animation, entry), 0);
}

/**
 * The frame name showing `ticks` into the animation. Past the end it starts over, so a looping
 * animation can be asked for any tick, even a negative one (a tile that starts late).
 */
export function frameAt(animation: Animation, ticks: number): string {
  let remaining = positiveModulo(ticks, duration(animation));
  for (const entry of animation.frames) {
    const length = entryTicks(animation, entry);
    if (remaining < length) {
      return typeof entry === 'string' ? entry : entry[0];
    }
    remaining -= length;
  }
  throw new Error('Animation has no frames');
}

/** A random number of ticks until an event plays again: within every_ticks, both ends included. */
export function randomEventGap(animation: Animation, random: () => number): number {
  const range =
    animation.every_ticks ?? (animation.event === true ? undefined : animation.event?.every_ticks);
  if (range === undefined) {
    throw new Error('Animation has no every_ticks');
  }
  const [min, max] = range;
  return min + Math.floor(random() * (max - min + 1));
}

function entryTicks(animation: Animation, entry: FrameEntry): number {
  return typeof entry === 'string' ? (animation.ticks_per_frame ?? 1) : entry[1];
}

/** Like %, but never negative: positiveModulo(-1, 4) is 3, where -1 % 4 is -1. */
function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
