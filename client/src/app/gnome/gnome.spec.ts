import { Direction } from '../direction';
import { Walls } from '../walls';
import { Gnome } from './gnome';

/** An 8 × 8 tile lawn without walls, so a gnome near its middle can walk freely. */
const OPEN_LAWN = Walls.of({ grid: Array<string>(8).fill('........'), legend: {}, walkable: ['.'] });

/** Where a gnome ends up after one move from (32, 48), a start tile at tile × 16. */
function positionAfterMoving(direction: Direction): { x: number; y: number } {
  const gnome = new Gnome(32, 48, OPEN_LAWN);
  gnome.move(direction);
  return { x: gnome.x, y: gnome.y };
}

describe('Gnome', () => {
  it('steps exactly one unit along one axis per move', () => {
    expect(positionAfterMoving('up')).toEqual({ x: 32, y: 47 });
    expect(positionAfterMoving('down')).toEqual({ x: 32, y: 49 });
    expect(positionAfterMoving('left')).toEqual({ x: 31, y: 48 });
    expect(positionAfterMoving('right')).toEqual({ x: 33, y: 48 });
  });

  it('stands facing the way it last moved, so its idle frame turns too', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);

    gnome.move('left');
    gnome.stop();
    expect(gnome.frameName).toBe('red/left_idle');

    gnome.move('up');
    gnome.stop();
    expect(gnome.frameName).toBe('red/up_idle');
  });

  it('walks through its four walk frames, 4 ticks each, and starts over after one tile', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    const framesShown: string[] = [];
    for (let tick = 1; tick <= 17; tick++) {
      gnome.move('right');
      framesShown.push(gnome.frameName);
    }

    expect(framesShown).toEqual([
      ...Array<string>(4).fill('red/right_walk_0'),
      ...Array<string>(4).fill('red/right_walk_1'),
      ...Array<string>(4).fill('red/right_walk_2'),
      ...Array<string>(4).fill('red/right_walk_3'),
      'red/right_walk_0',
    ]);
  });

  it('starts its walk over at the first walk frame after standing still', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    for (let tick = 1; tick <= 6; tick++) {
      gnome.move('down');
    }
    gnome.stop();
    gnome.move('down');

    expect(gnome.frameName).toBe('red/down_walk_0');
  });

  it('stands idle facing a wall it walks into, without moving', () => {
    // A column of three tiles with a wall at the top. The gnome walks up one tile, to y 16, and
    // then into the wall.
    const walls = Walls.of({ grid: ['#', '.', '.'], legend: {}, walkable: ['.'] });
    const gnome = new Gnome(0, 32, walls);
    for (let tick = 1; tick <= 17; tick++) {
      gnome.move('up');
    }

    expect({ x: gnome.x, y: gnome.y }).toEqual({ x: 0, y: 16 });
    expect(gnome.frameName).toBe('red/up_idle');
  });

  it('keeps its stride when it turns without stopping', () => {
    const gnome = new Gnome(32, 48, OPEN_LAWN);
    for (let tick = 1; tick <= 4; tick++) {
      gnome.move('up');
    }
    gnome.move('left');

    expect(gnome.frameName).toBe('red/left_walk_1');
  });
});
