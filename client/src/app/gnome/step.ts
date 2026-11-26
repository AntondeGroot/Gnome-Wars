import { Direction } from '../direction';
import { Obstacles, Position, TILE_UNITS } from '../walls';

/** How one unit of movement changes x and y, per direction. */
const ONE_UNIT: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/**
 * Where one unit of movement `direction` takes a gnome at `from`, or null when a wall or pod stops
 * it. When one is ahead but the gnome is only partly in front of it, beside an opening, it is
 * nudged one unit sideways towards that opening instead, so it slips round corners without having
 * to line up to the exact unit.
 */
export function stepToward(
  from: Position,
  direction: Direction,
  obstacles: Obstacles,
): Position | null {
  const ahead = plus(from, ONE_UNIT[direction]);
  if (!obstacles.blocks(ahead)) {
    return ahead;
  }
  return nudgeTowardOpening(from, direction, obstacles);
}

/**
 * One unit towards the nearest lane (row or column of tiles) the gnome could walk along, if that
 * lane is open ahead; null when the gnome is already in that lane, or it is blocked there too.
 */
function nudgeTowardOpening(
  from: Position,
  direction: Direction,
  obstacles: Obstacles,
): Position | null {
  const across = direction === 'up' || direction === 'down' ? 'x' : 'y';
  const nearestLane = Math.round(from[across] / TILE_UNITS) * TILE_UNITS;
  if (nearestLane === from[across]) {
    return null;
  }
  const inLane = { ...from, [across]: nearestLane };
  if (obstacles.blocks(plus(inLane, ONE_UNIT[direction]))) {
    return null;
  }
  return { ...from, [across]: from[across] + Math.sign(nearestLane - from[across]) };
}

function plus(position: Position, offset: Position): Position {
  return { x: position.x + offset.x, y: position.y + offset.y };
}
