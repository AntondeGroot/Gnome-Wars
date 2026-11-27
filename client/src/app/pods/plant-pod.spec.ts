import { Gnome } from '../gnome/gnome';
import { Walls } from '../walls';
import { plantPod } from './plant-pod';
import { Pod } from './pod';

/** An 8 × 8 tile lawn without walls, so a gnome can stand anywhere near its middle. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
  legend: {},
  walkable: ['.'],
});

describe('plantPod', () => {
  it('refuses a pod once the gnome has as many out as its limit', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    const podOnAnotherTile: Pod = {
      tile: { x: 5, y: 5 },
      owner: gnome,
      plantedAt: 0,
      blastRange: 1,
    };

    expect(plantPod(gnome, [podOnAnotherTile], 10)).toBeNull();
  });

  it('refuses a second pod on a tile that already has one', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    const neighbour = new Gnome(48, 48, OPEN_LAWN);
    const neighboursPodUnderGnome: Pod = {
      tile: { x: 2, y: 3 },
      owner: neighbour,
      plantedAt: 0,
      blastRange: 1,
    };

    expect(plantPod(gnome, [neighboursPodUnderGnome], 10)).toBeNull();
  });

  it('plants on the tile the gnome overlaps most when it stands between two', () => {
    const mostlyOnTileTwo = new Gnome(39, 48, OPEN_LAWN);
    const mostlyOnTileThree = new Gnome(41, 48, OPEN_LAWN);

    expect(plantPod(mostlyOnTileTwo, [], 10)?.tile).toEqual({ x: 2, y: 3 });
    expect(plantPod(mostlyOnTileThree, [], 10)?.tile).toEqual({ x: 3, y: 3 });
  });

  it("does not count another gnome's pods toward its own limit", () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    const neighbour = new Gnome(80, 80, OPEN_LAWN);
    const neighboursPod: Pod = {
      tile: { x: 5, y: 5 },
      owner: neighbour,
      plantedAt: 0,
      blastRange: 1,
    };

    expect(plantPod(gnome, [neighboursPod], 10)).not.toBeNull();
  });

  it('records which gnome planted the pod and on which tick, so its fuse can count down', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);

    expect(plantPod(gnome, [], 42)).toEqual({
      tile: { x: 2, y: 3 },
      owner: gnome,
      plantedAt: 42,
      blastRange: 1,
    });
  });
});
