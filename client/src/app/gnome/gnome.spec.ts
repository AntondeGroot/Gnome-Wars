import { Direction } from '../direction';
import { Gnome } from './gnome';

/** Where a gnome ends up after one move from (32, 48), a start tile at tile × 16. */
function positionAfterMoving(direction: Direction): { x: number; y: number } {
  const gnome = new Gnome(32, 48);
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
    const gnome = new Gnome(32, 48);

    gnome.move('left');
    gnome.stop();
    expect(gnome.frameName).toBe('red/left_idle');

    gnome.move('up');
    gnome.stop();
    expect(gnome.frameName).toBe('red/up_idle');
  });

  it('walks through its four walk frames, 4 ticks each, and starts over after one tile', () => {
    const gnome = new Gnome(32, 48);
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
    const gnome = new Gnome(32, 48);
    for (let tick = 1; tick <= 6; tick++) {
      gnome.move('down');
    }
    gnome.stop();
    gnome.move('down');

    expect(gnome.frameName).toBe('red/down_walk_0');
  });

  it('keeps its stride when it turns without stopping', () => {
    const gnome = new Gnome(32, 48);
    for (let tick = 1; tick <= 4; tick++) {
      gnome.move('up');
    }
    gnome.move('left');

    expect(gnome.frameName).toBe('red/left_walk_1');
  });
});
