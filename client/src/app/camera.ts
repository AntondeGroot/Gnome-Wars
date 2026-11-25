import { Position } from './walls';

/** A width and height in game pixels. */
export interface Size {
  width: number;
  height: number;
}

/** The part of the arena the screen shows: as much as fits, and never more than the whole arena. */
export function viewSize(screen: Size, arena: Size): Size {
  return {
    width: Math.min(screen.width, arena.width),
    height: Math.min(screen.height, arena.height),
  };
}

/**
 * The top-left corner of the view, in arena pixels: centred on `focus` (the player's gnome), but
 * stopped at the arena's edges so the view never shows past the fence. When the arena fits, that
 * is always (0, 0): the whole arena.
 */
export function cameraPosition(focus: Position, view: Size, arena: Size): Position {
  return {
    x: centredWithin(focus.x, view.width, arena.width),
    y: centredWithin(focus.y, view.height, arena.height),
  };
}

/** Where a view of `viewLength` starts on one axis, centred on `focus` but kept inside the arena. */
function centredWithin(focus: number, viewLength: number, arenaLength: number): number {
  // Whole pixels, so the pixel art stays crisp.
  const centred = Math.round(focus - viewLength / 2);
  return Math.min(Math.max(centred, 0), arenaLength - viewLength);
}
