import { Breakables } from './breakables';

describe('Breakables', () => {
  it('blocks walking onto a hedge until a blast destroys it', () => {
    // One row: grass, then a hedge at (1, 0).
    const breakables = Breakables.of({
      grid: ['.h'],
      tiles: { '.': { walkable: true }, h: { frame: 'hedge', breakable: true } },
    });
    const halfOnTheHedge = { x: 8, y: 0 };

    expect(breakables.blocks(halfOnTheHedge)).toBe(true);

    breakables.destroy({ x: 1, y: 0 });

    expect(breakables.blocks(halfOnTheHedge)).toBe(false);
  });
});
