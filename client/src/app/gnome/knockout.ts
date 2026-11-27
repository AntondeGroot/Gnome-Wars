import gnomeAtlas from '../../../public/sprites/atlases/gnome_atlas.json';

/** One step of the knockout animation: a frame, how long it shows, and a sideways shake. */
export interface KnockoutStep {
  /** The frame name without its skin, such as "knockout_statue". */
  readonly frame: string;
  /** How many ticks it shows; 0 for the last frame, which stays until the round ends. */
  readonly ticks: number;
  /** Game pixels to move it sideways, for the shake while it cracks. */
  readonly dx: number;
}

/** As the atlas writes a step: [frame, ticks] or [frame, ticks, { dx }]. */
type AtlasStep = (string | number | { dx: number })[];

const STEPS: KnockoutStep[] = gnomeAtlas.animations.knockout.frames.map(toStep);

/** The step to show `ticksOut` ticks after the gnome lost its last life. */
export function knockoutStep(ticksOut: number): KnockoutStep {
  let start = 0;
  for (const step of STEPS) {
    if (step.ticks === 0 || ticksOut < start + step.ticks) {
      return step;
    }
    start += step.ticks;
  }
  return STEPS[STEPS.length - 1];
}

function toStep([frame, ticks, shake]: AtlasStep): KnockoutStep {
  return {
    frame: String(frame),
    ticks: Number(ticks),
    dx: typeof shake === 'object' ? shake.dx : 0,
  };
}
