import { autotileFrame } from './autotile';

describe('autotileFrame', () => {
  it('gives every tile of a 3 × 3 pond its own corner, edge or centre piece', () => {
    const grid = [
      '.....', //
      '.~~~.',
      '.~~~.',
      '.~~~.',
      '.....',
    ];

    const pondFrames = [1, 2, 3].map((y) =>
      [1, 2, 3].map((x) => autotileFrame('pond', grid, x, y)),
    );

    expect(pondFrames).toEqual([
      ['pond_tl', 'pond_t', 'pond_tr'],
      ['pond_l', 'pond_c', 'pond_r'],
      ['pond_bl', 'pond_b', 'pond_br'],
    ]);
  });

  it('gives a 2 × 2 pond only corner pieces, because every tile is on two edges', () => {
    const grid = [
      '....', //
      '.~~.',
      '.~~.',
      '....',
    ];

    const pondFrames = [1, 2].map((y) => [1, 2].map((x) => autotileFrame('pond', grid, x, y)));

    expect(pondFrames).toEqual([
      ['pond_tl', 'pond_tr'],
      ['pond_bl', 'pond_br'],
    ]);
  });

  it('treats the space beyond the edge of the grid as not pond', () => {
    // The pond fills the whole grid, so every outer neighbour lies outside it.
    const grid = [
      '~~~', //
      '~~~',
    ];

    const pondFrames = [0, 1].map((y) => [0, 1, 2].map((x) => autotileFrame('pond', grid, x, y)));

    expect(pondFrames).toEqual([
      ['pond_tl', 'pond_t', 'pond_tr'],
      ['pond_bl', 'pond_b', 'pond_br'],
    ]);
  });
});
