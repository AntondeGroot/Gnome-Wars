import { Gnome } from './gnome';
import { Lives } from './lives';

/** The atlas draws four walk frames per direction: down_walk_0 to down_walk_3. */
const WALK_FRAMES = 4;
/**
 * Units walked per walk frame: a full cycle of 4 frames covers 16 units, one tile, so the feet keep
 * pace with the ground at any speed.
 */
const UNITS_PER_WALK_FRAME = 4;
/** While protected, a gnome is hidden for this many ticks, then shown for as many: it blinks. */
const BLINK_TICKS = 4;

/** The skin sheet frame for `gnome` as it stands or walks, such as "blue/left_walk_1". */
export function frameNameOf(gnome: Gnome): string {
  return `${gnome.skin}/${gnome.facing}_${poseOf(gnome)}`;
}

/** Whether to draw a gnome with these `lives` on `tick`: every other 4 ticks while protected. */
export function isDrawnOn(lives: Lives, tick: number): boolean {
  const hitAt = lives.hitAt;
  if (hitAt === null || !lives.isProtected(tick)) {
    return true;
  }
  return Math.floor((tick - hitAt) / BLINK_TICKS) % 2 === 1;
}

/** "idle", or the walk frame: walk_0 from the first unit, then the next every 4 units walked. */
function poseOf(gnome: Gnome): string {
  if (gnome.unitsWalked === 0) {
    return 'idle';
  }
  const walkFrame = Math.floor((gnome.unitsWalked - 1) / UNITS_PER_WALK_FRAME) % WALK_FRAMES;
  return `walk_${walkFrame}`;
}
