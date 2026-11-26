import POD_RULES from '../../../../shared/rules/pods.json';
import { Gnome } from '../gnome/gnome';
import { TILE_UNITS, Walls } from '../walls';
import { PodsOnLawn } from './pods-on-lawn';

/** An 8 × 8 tile lawn without walls, so a gnome can stand anywhere near its middle. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
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

describe('PodsOnLawn', () => {
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
