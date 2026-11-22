import backyardAtlas from '../../public/sprites/atlases/backyard_atlas.json';
import { ArenaMap, BACKYARD } from './arena-map';
import { autotileFrame, isAutotile } from './autotile';
import { SpriteAtlas } from './sprite-atlas';

/** Counts characters, not string units, so a character that is secretly two (like ⬛️) counts as two tiles. */
function tileCount(row: string): number {
  return [...row].length;
}

interface AutotileTile {
  x: number;
  y: number;
  letter: string;
  name: string;
}

/** Every tile in the map whose letter stands for an autotile, such as a pond or shed. */
function autotileTilesIn(map: ArenaMap): AutotileTile[] {
  const tiles: AutotileTile[] = [];
  for (const [y, row] of map.grid.entries()) {
    for (const [x, letter] of [...row].entries()) {
      const name = map.legend[letter];
      if (name !== null && isAutotile(name)) {
        tiles.push({ x, y, letter, name });
      }
    }
  }
  return tiles;
}

/** The frame every autotile tile in the map would be drawn with, e.g. "pond_tl". */
function autotileFramesIn(map: ArenaMap): string[] {
  return autotileTilesIn(map).map(({ x, y, name }) => autotileFrame(name, map.grid, x, y));
}

/** The letter at (x, y), or undefined outside the grid. */
function letterAt(map: ArenaMap, x: number, y: number): string | undefined {
  const row = map.grid[y];
  return row === undefined ? undefined : [...row][x];
}

describe('the backyard map', () => {
  it('has the same number of tiles in every row', () => {
    const firstRowWidth = tileCount(BACKYARD.grid[0]);

    const rowsWithDifferentWidth = BACKYARD.grid.filter((row) => tileCount(row) !== firstRowWidth);

    expect(rowsWithDifferentWidth).toEqual([]);
  });

  it('has a legend entry for every letter in the grid', () => {
    const lettersInGrid = new Set(BACKYARD.grid.flatMap((row) => [...row]));

    const lettersWithoutEntry = [...lettersInGrid].filter(
      (letter) => !Object.hasOwn(BACKYARD.legend, letter),
    );

    expect(lettersWithoutEntry).toEqual([]);
  });

  it('only names frames or multi-tile pieces that exist in the backyard atlas', () => {
    const atlas: SpriteAtlas = backyardAtlas;
    // null in the legend means "no prop on this tile", so it names nothing.
    const namesInLegend = new Set(
      Object.values(BACKYARD.legend).filter((name): name is string => name !== null),
    );

    const unknownNames = [...namesInLegend].filter(
      (name) => !Object.hasOwn(atlas.frames, name) && !Object.hasOwn(atlas.multi_tile, name),
    );

    expect(unknownNames).toEqual([]);
  });

  it('only asks for autotile pieces that exist in the backyard atlas', () => {
    // A shed has only corner frames, so a shed bigger than 2 × 2 asks for an edge like shed_b.
    const atlas: SpriteAtlas = backyardAtlas;
    const autotileFrames = new Set(autotileFramesIn(BACKYARD));

    const missingFrames = [...autotileFrames].filter(
      (frame) => !Object.hasOwn(atlas.frames, frame),
    );

    expect(missingFrames).toEqual([]);
  });

  it('gives every autotile tile a neighbour of its own kind both vertically and horizontally', () => {
    // A tile without one is part of an area thinner than 2 tiles, which draws as a broken piece:
    // a lone ~ becomes just pond_tl.
    const sameLetterAt = (letter: string, x: number, y: number): boolean =>
      letterAt(BACKYARD, x, y) === letter;

    const tilesMissingANeighbour = autotileTilesIn(BACKYARD)
      .filter(({ x, y, letter }) => {
        const hasVertical = sameLetterAt(letter, x, y - 1) || sameLetterAt(letter, x, y + 1);
        const hasHorizontal = sameLetterAt(letter, x - 1, y) || sameLetterAt(letter, x + 1, y);
        return !(hasVertical && hasHorizontal);
      })
      .map(({ x, y, name }) => `${name} at row ${y + 1}, column ${x + 1}`);

    expect(tilesMissingANeighbour).toEqual([]);
  });
});
