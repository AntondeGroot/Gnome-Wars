import POD_RULES from '../../../../shared/rules/pods.json';
import { Direction } from '../direction';
import { Gnome } from '../gnome/gnome';
import { TILE_UNITS, Walls } from '../walls';
import { PodsOnLawn } from './pods-on-lawn';

/** An 8 × 8 tile lawn without walls, so a gnome can stand anywhere near its middle. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
  legend: {},
  walkable: ['.'],
});
/**
 * A 5 × 3 lawn with a wall at (3, 2): a gnome walking down over columns 2 and 3 runs into it, and
 * would be nudged left into column 2, where the pod lies.
 */
const CORNER_LAWN = Walls.of({
  grid: ['.....', '.....', '...#.'],
  legend: {},
  walkable: ['.'],
});
const PLANTED_AT = 10;
const BURNT_OUT_AT = PLANTED_AT + POD_RULES.fuseTicks;

/** Off the tile it planted on, so a full tile can't be why a second pod is refused. */
function walkOneTileRight(gnome: Gnome): void {
  for (let unit = 0; unit < TILE_UNITS; unit++) {
    gnome.move('right');
  }
}

/**
 * Walks `units` units, one per tick as in the game: each move meets the pods in the way, then the
 * pods update. Ticks count on from just after PLANTED_AT, well before any fuse runs out.
 */
function walkAmongPods(gnome: Gnome, pods: PodsOnLawn, direction: Direction, units: number): void {
  for (let unit = 1; unit <= units; unit++) {
    gnome.move(direction, pods.obstaclesFor(gnome));
    pods.update(gnome, false, PLANTED_AT + unit);
  }
}

describe('PodsOnLawn', () => {
  it('stops a gnome walking back onto its pod once it has stepped off', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    pods.update(gnome, true, PLANTED_AT);

    walkAmongPods(gnome, pods, 'right', TILE_UNITS);
    walkAmongPods(gnome, pods, 'left', 1);

    expect(gnome.x).toBe(32 + TILE_UNITS);
  });

  it('lets a gnome step back onto its pod while it is still partly on it', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    pods.update(gnome, true, PLANTED_AT);

    walkAmongPods(gnome, pods, 'right', TILE_UNITS - 1);
    walkAmongPods(gnome, pods, 'left', TILE_UNITS - 1);

    expect(gnome.x).toBe(32);
  });

  it('stops another gnome walking onto a pod, even while its planter still stands on it', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    const planter = new Gnome(32, 48, OPEN_LAWN);
    const neighbour = new Gnome(64, 48, OPEN_LAWN);
    pods.update(planter, true, PLANTED_AT);

    walkAmongPods(neighbour, pods, 'left', TILE_UNITS + 1);

    expect(neighbour.x).toBe(32 + TILE_UNITS);
  });

  it('does not nudge a gnome round a corner onto a pod', () => {
    const pods = new PodsOnLawn(CORNER_LAWN);
    const planter = new Gnome(32, 32, CORNER_LAWN);
    pods.update(planter, true, PLANTED_AT);
    // Mostly over column 2, partly over the wall in column 3 below it.
    const walker = new Gnome(36, 16, CORNER_LAWN);

    walkAmongPods(walker, pods, 'down', 1);

    expect({ x: walker.x, y: walker.y }).toEqual({ x: 36, y: 16 });
  });

  it('removes a pod when its fuse runs out, so its gnome may plant there again', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    const gnome = new Gnome(32, 48, OPEN_LAWN);

    pods.update(gnome, true, PLANTED_AT);
    pods.update(gnome, false, BURNT_OUT_AT - 1);
    expect(pods.all).toHaveLength(1);

    pods.update(gnome, true, BURNT_OUT_AT);
    expect(pods.all).toEqual([{ tile: { x: 2, y: 3 }, owner: gnome, plantedAt: BURNT_OUT_AT }]);
  });

  it("bursts a pod whose fuse ran out, as far as its gnome's blast range", () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    gnome.stats.addBlastRange();

    pods.update(gnome, true, PLANTED_AT);
    pods.update(gnome, false, BURNT_OUT_AT);

    expect(pods.all).toEqual([]);
    expect(pods.allBlasts).toHaveLength(1);
    const [blast] = pods.allBlasts;
    expect(blast.startedAt).toBe(BURNT_OUT_AT);
    expect(blast.cells).toContainEqual({ tile: { x: 2, y: 1 }, part: 'end', direction: 'up' });
  });

  it('plants once while the plant key is held; a second pod needs a new press', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    gnome.stats.addPod();

    pods.update(gnome, true, PLANTED_AT);
    walkOneTileRight(gnome);
    pods.update(gnome, true, PLANTED_AT + 1);
    expect(pods.all).toHaveLength(1);

    pods.update(gnome, false, PLANTED_AT + 2);
    pods.update(gnome, true, PLANTED_AT + 3);
    expect(pods.all).toHaveLength(2);
  });
});
