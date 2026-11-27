import POD_RULES from '../../../../../shared/rules/pods.json';
import { Breakables } from './breakables';
import { Direction } from './direction';
import { Gnome } from '../../gnome/gnome';
import { TILE_UNITS, Walls } from './walls';
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
  it('bursts a pod as far as its gnome could blast when planting, not after a power-up', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    const gnome = new Gnome(32, 48, OPEN_LAWN);

    pods.update(gnome, true, PLANTED_AT);
    gnome.stats.addBlastRange();
    pods.update(gnome, false, BURNT_OUT_AT);

    // A range of 1, as when planted: the centre and one tile each way. A range of 2 would give 9.
    const [blast] = pods.allBlasts;
    expect(blast.cells).toHaveLength(5);
  });

  it('bursts a pod that a blast reaches on that tick, long before its own fuse runs out', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    // Side by side, on tiles (2, 3) and (3, 3): the first pod's blast reaches the second.
    const first = new Gnome(32, 48, OPEN_LAWN);
    const second = new Gnome(48, 48, OPEN_LAWN);

    pods.update(first, true, PLANTED_AT);
    pods.update(second, false, PLANTED_AT + 29);
    pods.update(second, true, PLANTED_AT + 30);
    pods.update(first, false, BURNT_OUT_AT);

    expect(pods.all).toEqual([]);
    expect(pods.allBlasts.map((blast) => blast.startedAt)).toEqual([BURNT_OUT_AT, BURNT_OUT_AT]);
  });

  it('carries the chain on to a pod only the second blast reaches', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    // In a row on tiles (1, 3), (2, 3) and (3, 3), with a range of 1: only the middle pod's blast
    // reaches the last one.
    const [first, middle, last] = [16, 32, 48].map((x) => new Gnome(x, 48, OPEN_LAWN));

    pods.update(first, true, PLANTED_AT);
    pods.update(middle, false, PLANTED_AT + 1);
    pods.update(middle, true, PLANTED_AT + 2);
    pods.update(last, false, PLANTED_AT + 3);
    pods.update(last, true, PLANTED_AT + 4);
    pods.update(first, false, BURNT_OUT_AT);

    expect(pods.all).toEqual([]);
    expect(pods.allBlasts).toHaveLength(3);
  });

  it('ends a blast arm on the pod it reaches, even with range to spare', () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    // On tile (2, 3) with a range of 3, next to a pod on (3, 3).
    const first = new Gnome(32, 48, OPEN_LAWN);
    const second = new Gnome(48, 48, OPEN_LAWN);
    first.stats.addBlastRange();
    first.stats.addBlastRange();

    pods.update(first, true, PLANTED_AT);
    pods.update(second, false, PLANTED_AT + 1);
    pods.update(second, true, PLANTED_AT + 2);
    pods.update(first, false, BURNT_OUT_AT);

    const [firstBlast] = pods.allBlasts;
    expect(firstBlast.cells.filter((cell) => cell.direction === 'right')).toEqual([
      { tile: { x: 3, y: 3 }, part: 'end', direction: 'right' },
    ]);
  });

  it("leaves a pod out of the blast's reach to its own fuse", () => {
    const pods = new PodsOnLawn(OPEN_LAWN);
    // On tiles (2, 3) and (4, 3), with a range of 1: the first blast stops a tile short.
    const first = new Gnome(32, 48, OPEN_LAWN);
    const farOff = new Gnome(64, 48, OPEN_LAWN);

    pods.update(first, true, PLANTED_AT);
    pods.update(farOff, false, PLANTED_AT + 1);
    pods.update(farOff, true, PLANTED_AT + 2);
    pods.update(first, false, BURNT_OUT_AT);

    expect(pods.all).toEqual([
      { tile: { x: 4, y: 3 }, owner: farOff, plantedAt: PLANTED_AT + 2, blastRange: 1 },
    ]);
    expect(pods.allBlasts).toHaveLength(1);
  });

  it('destroys only the first breakable in a direction, even with range to spare', () => {
    const hedgeRow = { grid: ['...hh'], legend: { h: 'hedge' }, walkable: ['.'], breakable: ['h'] };
    const breakables = Breakables.of(hedgeRow);
    const pods = new PodsOnLawn(Walls.forBlasts(hedgeRow), breakables);
    // On tile (1, 0), with a blast range of 3: enough to reach both hedges, at (3, 0) and (4, 0).
    const gnome = new Gnome(16, 0, Walls.of(hedgeRow));
    gnome.stats.addBlastRange();
    gnome.stats.addBlastRange();

    pods.update(gnome, true, PLANTED_AT);
    pods.update(gnome, false, BURNT_OUT_AT);

    expect(breakables.has({ x: 3, y: 0 })).toBe(false);
    expect(breakables.has({ x: 4, y: 0 })).toBe(true);
  });

  it('destroys the first breakable in each of the four directions at once', () => {
    // A hedge right next to the pod's tile, (2, 2), on every side.
    const hedgeCross = {
      grid: ['.....', '..h..', '.h.h.', '..h..', '.....'],
      legend: { h: 'hedge' },
      walkable: ['.'],
      breakable: ['h'],
    };
    const breakables = Breakables.of(hedgeCross);
    const pods = new PodsOnLawn(Walls.forBlasts(hedgeCross), breakables);
    const gnome = new Gnome(32, 32, Walls.of(hedgeCross));

    pods.update(gnome, true, PLANTED_AT);
    pods.update(gnome, false, BURNT_OUT_AT);

    expect(breakables.all).toEqual([]);
  });

  it('stops two pods bursting on one tick at the same first breakable in a line', () => {
    const hedgeRow = { grid: ['..hh.'], legend: { h: 'hedge' }, walkable: ['.'], breakable: ['h'] };
    const breakables = Breakables.of(hedgeRow);
    const pods = new PodsOnLawn(Walls.forBlasts(hedgeRow), breakables);
    // Both with a range of 2. The first, on (0, 0), reaches the hedge at (2, 0). The second, on
    // (1, 0), would reach the one at (3, 0) if the first blast cleared (2, 0) before its own was
    // worked out.
    const first = new Gnome(0, 0, Walls.of(hedgeRow));
    const second = new Gnome(16, 0, Walls.of(hedgeRow));
    first.stats.addBlastRange();
    second.stats.addBlastRange();

    pods.update(first, true, PLANTED_AT);
    pods.update(second, false, PLANTED_AT);
    pods.update(second, true, PLANTED_AT);
    pods.update(first, false, BURNT_OUT_AT);

    expect(breakables.has({ x: 2, y: 0 })).toBe(false);
    expect(breakables.has({ x: 3, y: 0 })).toBe(true);
  });

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
    expect(pods.all).toEqual([
      { tile: { x: 2, y: 3 }, owner: gnome, plantedAt: BURNT_OUT_AT, blastRange: 1 },
    ]);
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
