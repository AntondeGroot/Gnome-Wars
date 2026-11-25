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

  it('turns to face the way it last moved, so its frame turns too', () => {
    const gnome = new Gnome(32, 48);

    gnome.move('left');
    expect(gnome.frameName).toBe('red/left_idle');

    gnome.move('up');
    expect(gnome.frameName).toBe('red/up_idle');
  });
});
