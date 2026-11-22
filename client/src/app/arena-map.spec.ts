import backyardAtlas from '../../public/sprites/atlases/backyard_atlas.json';
import { BACKYARD } from './arena-map';
import { SpriteAtlas } from './sprite-atlas';

/** Counts characters, not string units, so a character that is secretly two (like ⬛️) counts as two tiles. */
function tileCount(row: string): number {
  return [...row].length;
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

  it('only names frames that exist in the backyard atlas', () => {
    const atlas: SpriteAtlas = backyardAtlas;
    // null in the legend means "no prop on this tile", so it names no frame.
    const frameNamesInLegend = new Set(
      Object.values(BACKYARD.legend).filter((name): name is string => name !== null),
    );

    const unknownFrameNames = [...frameNamesInLegend].filter(
      (name) => !Object.hasOwn(atlas.frames, name),
    );

    expect(unknownFrameNames).toEqual([]);
  });
});
