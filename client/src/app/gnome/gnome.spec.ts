import { Direction } from '../game/rules/direction';
import { Walls } from '../game/rules/walls';
import { Gnome } from './gnome';

/** An 8 × 8 tile lawn without walls, so a gnome near its middle can walk freely. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
  tiles: { '.': { walkable: true } },
});

/** Where a gnome ends up after one move from (32, 48), a start tile at tile × 16. */
function positionAfterMoving(direction: Direction): { x: number; y: number } {
  const gnome = new Gnome(32, 48, OPEN_LAWN);
  gnome.move(direction);
  return { x: gnome.x, y: gnome.y };
}

describe('Gnome', () => {
  it('walks unitsPerSecond / 30 units a tick at a higher speed, keeping the rest for later', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    gnome.stats.addSpeed(); // 40 units a second: 1⅓ units a tick

    const xAfterEachTick = [1, 2, 3, 4, 5, 6].map(() => {
      gnome.move('right');
      return gnome.x;
    });

    expect(xAfterEachTick).toEqual([33, 34, 36, 37, 38, 40]);
  });

  it('steps exactly one unit along one axis per move', () => {
    expect(positionAfterMoving('up')).toEqual({ x: 32, y: 47 });
    expect(positionAfterMoving('down')).toEqual({ x: 32, y: 49 });
    expect(positionAfterMoving('left')).toEqual({ x: 31, y: 48 });
    expect(positionAfterMoving('right')).toEqual({ x: 33, y: 48 });
  });
});
