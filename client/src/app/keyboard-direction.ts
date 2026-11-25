import { Direction } from './direction';
import { HeldKeys } from './held-keys';

/**
 * Which keys steer which way, by event.code: the arrow keys and WASD. Listed in the order they win
 * when several are held, as a gnome moves in one direction at a time.
 */
const KEYS_PER_DIRECTION: [Direction, string[]][] = [
  ['up', ['ArrowUp', 'KeyW']],
  ['down', ['ArrowDown', 'KeyS']],
  ['left', ['ArrowLeft', 'KeyA']],
  ['right', ['ArrowRight', 'KeyD']],
];

/** Every key that steers the gnome. */
export const STEERING_KEYS = new Set(KEYS_PER_DIRECTION.flatMap(([, keys]) => keys));

/** The way the held keys steer the gnome, or null when none of them steers. */
export function directionFrom(heldKeys: HeldKeys): Direction | null {
  const steered = KEYS_PER_DIRECTION.find(([, keys]) => keys.some((key) => heldKeys.isHeld(key)));
  return steered === undefined ? null : steered[0];
}
