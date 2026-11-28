import LIVES_RULES from '../../../../../shared/rules/lives.json';
import POD_RULES from '../../../../../shared/rules/pods.json';
import { Gnome } from '../../gnome/gnome';
import { Walls } from './walls';
import { Blast } from '../../pods/blast';
import { hitGnomesInBlasts } from './knock-outs';
import { plantPod } from './plant-pod';

/** An 8 × 8 tile lawn without walls, so a gnome can stand anywhere near its middle. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
  tiles: { '.': { walkable: true } },
});
const BURST_AT = 10;

describe('hitGnomesInBlasts', () => {
  it('takes only one life from a gnome that stands in a blast for its whole length', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    const blastOnGnome: Blast = {
      cells: [{ tile: { x: 2, y: 3 }, part: 'center' }],
      startedAt: BURST_AT,
    };

    for (let tick = BURST_AT; tick < BURST_AT + POD_RULES.blastTicks; tick++) {
      hitGnomesInBlasts([gnome], [blastOnGnome], tick);
    }

    expect(gnome.lives.remaining).toBe(2);
  });

  it('takes another life from a blast that comes once the protection has run out', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    const blastOnGnome: Blast = {
      cells: [{ tile: { x: 2, y: 3 }, part: 'center' }],
      startedAt: BURST_AT,
    };
    const protectionEnds = BURST_AT + LIVES_RULES.protectedTicks;

    hitGnomesInBlasts([gnome], [blastOnGnome], BURST_AT);
    hitGnomesInBlasts([gnome], [blastOnGnome], protectionEnds - 1);
    expect(gnome.lives.remaining).toBe(2);

    hitGnomesInBlasts([gnome], [blastOnGnome], protectionEnds);
    expect(gnome.lives.remaining).toBe(1);
  });

  it('puts a gnome out after three hits, so it can no longer walk or plant', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    const blastOnGnome: Blast = {
      cells: [{ tile: { x: 2, y: 3 }, part: 'center' }],
      startedAt: BURST_AT,
    };
    const hitTicks = [0, 1, 2].map((hit) => BURST_AT + hit * LIVES_RULES.protectedTicks);
    hitTicks.forEach((tick) => hitGnomesInBlasts([gnome], [blastOnGnome], tick));
    const afterwards = hitTicks[2] + 1;

    gnome.move('right');

    expect(gnome.lives.isOut).toBe(true);
    expect(gnome.x).toBe(32);
    expect(plantPod(gnome, [], afterwards)).toBeNull();
  });

  it('hits a gnome only when the tile under its centre is in the blast, not just its edge', () => {
    const blastOnTileThree: Blast = {
      cells: [{ tile: { x: 3, y: 3 }, part: 'end', direction: 'right' }],
      startedAt: BURST_AT,
    };
    // Both overlap tile (3, 3), but only the second has its centre on it.
    const mostlyOnTileTwo = new Gnome(39, 48, OPEN_LAWN);
    const mostlyOnTileThree = new Gnome(41, 48, OPEN_LAWN);

    hitGnomesInBlasts([mostlyOnTileTwo, mostlyOnTileThree], [blastOnTileThree], BURST_AT);

    expect(mostlyOnTileTwo.lives.remaining).toBe(LIVES_RULES.startingLives);
    expect(mostlyOnTileThree.lives.remaining).toBe(LIVES_RULES.startingLives - 1);
  });
});
