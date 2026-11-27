import { Animation, frameAt } from './animation';
import { PlacedProp } from './arena-props';

/** A prop that changes every few ticks, like the pond water, so it can't go in the static layer. */
export interface AnimatedTile {
  x: number;
  y: number;
  /** The prop's own frame name, filled in for "{piece}" in the animation's frames. */
  piece: string;
  animation: Animation;
  /** How many ticks this tile runs behind the others, so neighbours don't change in step. */
  delayTicks: number;
}

/**
 * Per animation, how many frames a tile at (x, y) starts late. Without it every pond tile glints at
 * the same moment and a big pond looks like a grid.
 */
const DELAY_IN_FRAMES: Record<string, (x: number, y: number) => number> = {
  pond_glint: (x, y) => (x + 2 * y) % 4,
};

/** Splits the props into those that never change and those that are animated. */
export function splitAnimated(
  props: PlacedProp[],
  animations: Record<string, Animation>,
): { stillProps: PlacedProp[]; animatedTiles: AnimatedTile[] } {
  const stillProps: PlacedProp[] = [];
  const animatedTiles: AnimatedTile[] = [];
  for (const prop of props) {
    const found = loopingAnimationFor(prop.frame, animations);
    if (found === undefined) {
      stillProps.push(prop);
    } else {
      animatedTiles.push(animatedTile(prop, ...found));
    }
  }
  return { stillProps, animatedTiles };
}

/** The frame name the tile shows at game tick `tick`. */
export function animatedTileFrame(tile: AnimatedTile, tick: number): string {
  return frameAt(tile.animation, tick - tile.delayTicks).replace('{piece}', tile.piece);
}

/**
 * The looping animation for a frame: one that lists it in applies_to, or else one that starts with
 * it (the bird bath's glint starts with "birdbath"). Names starting with "_" are notes, not animations.
 */
function loopingAnimationFor(
  frame: string,
  animations: Record<string, Animation>,
): [name: string, animation: Animation] | undefined {
  return Object.entries(animations).find(
    ([name, animation]) =>
      !name.startsWith('_') &&
      animation.loop === true &&
      (animation.applies_to?.includes(frame) ?? animation.frames[0] === frame),
  );
}

function animatedTile(prop: PlacedProp, name: string, animation: Animation): AnimatedTile {
  const delayInFrames = DELAY_IN_FRAMES[name]?.(prop.x, prop.y) ?? 0;
  return {
    x: prop.x,
    y: prop.y,
    piece: prop.frame,
    animation,
    delayTicks: delayInFrames * (animation.ticks_per_frame ?? 1),
  };
}
