import { Direction } from '../../direction';

/** Within this part of the stick's radius the gnome stands still. */
export const DEAD_ZONE = 0.33;
/**
 * How far the other axis may lead before the stick switches away from the current one: staying
 * horizontal while |dx| ≥ 0.75 × |dy|. Stops a thumb held on the diagonal flickering between two.
 */
export const HYSTERESIS = 0.75;

/**
 * The direction a thumbstick at (dx, dy) steers, relative to its centre and divided by its radius
 * (screen axes: dy grows downward). Null inside the dead zone. Otherwise the bigger axis wins, but
 * the axis of `current` keeps winning until the other one leads by more than the hysteresis margin.
 */
export function pickDirection(
  dx: number,
  dy: number,
  current: Direction | null,
  deadZone = DEAD_ZONE,
  hysteresis = HYSTERESIS,
): Direction | null {
  if (Math.hypot(dx, dy) < deadZone) {
    return null;
  }
  if (isHorizontal(dx, dy, current, hysteresis)) {
    return dx < 0 ? 'left' : 'right';
  }
  return dy < 0 ? 'up' : 'down';
}

function isHorizontal(dx: number, dy: number, current: Direction | null, hysteresis: number): boolean {
  const across = Math.abs(dx);
  const upDown = Math.abs(dy);
  if (current === 'left' || current === 'right') {
    return across >= hysteresis * upDown;
  }
  if (current === 'up' || current === 'down') {
    return upDown < hysteresis * across;
  }
  return across >= upDown;
}
