import { ArenaMap } from './arena-map';
import { propsIn } from './arena-props';

describe('propsIn', () => {
  it('leaves breakable letters out of the still props, as Breakables draws those', () => {
    // One row: a hedge the map places by letter, then a flower bed that never changes.
    const map: ArenaMap = {
      grid: ['h■'],
      tiles: { h: { frame: 'hedge', breakable: true }, '■': { frame: 'flower_bed_a' } },
    };

    expect(propsIn(map)).toEqual([{ x: 1, y: 0, frame: 'flower_bed_a' }]);
  });
});
