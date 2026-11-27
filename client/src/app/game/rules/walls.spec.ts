import { Walls } from './walls';

describe('Walls', () => {
  it('blocks every tile whose letter is not walkable, and everything outside the arena', () => {
    // One row: grass, a start tile, sandbox, then pond. Only the pond isn't in the walkable list.
    const walls = Walls.of({ grid: ['.S░≈'], legend: {}, walkable: ['.', 'S', '░'] });

    const blockedAtEachTile = [0, 16, 32, 48].map((x) => walls.blocks({ x, y: 0 }));
    expect(blockedAtEachTile).toEqual([false, false, false, true]);

    expect(walls.blocks({ x: -16, y: 0 })).toBe(true);
    expect(walls.blocks({ x: 0, y: 16 })).toBe(true);
  });

  it('lets blasts cross the pond, which gnomes cannot walk on, but not the bird bath', () => {
    // One row: grass, pond, bird bath. Blasts cross the pond only.
    const map = { grid: ['.≈b'], legend: {}, walkable: ['.'], blastsCross: ['≈'] };

    const blockedForBlasts = [0, 16, 32].map((x) => Walls.forBlasts(map).blocks({ x, y: 0 }));
    const blockedForGnomes = [0, 16, 32].map((x) => Walls.of(map).blocks({ x, y: 0 }));
    expect(blockedForBlasts).toEqual([false, false, true]);
    expect(blockedForGnomes).toEqual([false, true, true]);
  });
});
