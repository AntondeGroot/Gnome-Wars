/**
 * Autotiles: areas such as a pond that can be any rectangle from 2 × 2 up. Each tile picks its own
 * frame from its neighbours: a corner (tl, tr, bl, br), an edge (t, b, l, r) or the centre (c), so
 * a bigger pond just repeats more edge and centre frames.
 * Keyed by the name used in the map legend; the value is the prefix of the atlas frames, which
 * doesn't always match ("sandbox" → sand_tl, sand_t, …).
 */
export const AUTOTILE_PREFIXES: Record<string, string> = {
  pond: 'pond',
  sandbox: 'sand',
  shed: 'shed',
};

export function isAutotile(name: string): boolean {
  return Object.hasOwn(AUTOTILE_PREFIXES, name);
}

/** The frame for the tile at (x, y), e.g. "pond_tl" for the top-left tile of a pond. */
export function autotileFrame(name: string, grid: string[], x: number, y: number): string {
  return `${AUTOTILE_PREFIXES[name]}_${pieceSuffix(grid, x, y)}`;
}

/** "tl", "t", "tr", "l", "c", "r", "bl", "b" or "br", from which neighbours hold the same letter. */
function pieceSuffix(grid: string[], x: number, y: number): string {
  const letter = tileAt(grid, x, y);
  const sameAt = (dx: number, dy: number): boolean => tileAt(grid, x + dx, y + dy) === letter;

  const suffix =
    verticalEdge(sameAt(0, -1), sameAt(0, 1)) + horizontalEdge(sameAt(-1, 0), sameAt(1, 0));
  return suffix === '' ? 'c' : suffix;
}

function verticalEdge(sameAbove: boolean, sameBelow: boolean): string {
  if (!sameAbove) return 't';
  if (!sameBelow) return 'b';
  return '';
}

function horizontalEdge(sameLeft: boolean, sameRight: boolean): string {
  if (!sameLeft) return 'l';
  if (!sameRight) return 'r';
  return '';
}

/** The letter at (x, y), or undefined outside the grid. */
function tileAt(grid: string[], x: number, y: number): string | undefined {
  const row = grid[y];
  return row === undefined ? undefined : [...row][x];
}
