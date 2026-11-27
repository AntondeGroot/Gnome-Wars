import { AnimatedTile, splitAnimated } from './animated-tiles';
import { Animation } from './animation';
import { ArenaMap, BACKYARD, PlacedProp, propsIn } from './arena-map';
import { Bird, BIRD_BATH } from './bird';
import { Size } from './camera';
import { GnomeSprites } from './gnome/gnome-sprites';
import { Ladybug } from './ladybug';
import { GnomeStart, Match } from './match';
import { SeededRandom } from './seeded-random';
import { SpriteSheet } from './sprite-atlas';

/** A tile is 16 game pixels wide and high. */
export const TILE = 16;

/** The whole backyard in game pixels: 17 × 13 tiles. Counts characters, as one tile can be ░. */
export const ARENA_SIZE: Size = {
  width: [...BACKYARD.grid[0]].length * TILE,
  height: BACKYARD.grid.length * TILE,
};

// Temporary, until the enemies (E-steps): the grass tile where a ladybug stands and flaps.
const LADYBUG_TILE = { x: 11, y: 7 };
// The gnome the keys steer.
const PLAYER: GnomeStart = { tile: { x: 5, y: 5 }, skin: 'red' };
// Temporary, until there are more players: one gnome standing still in every other hat colour.
const BYSTANDERS: GnomeStart[] = [
  { tile: { x: 1, y: 1 }, skin: 'purple' },
  { tile: { x: 15, y: 1 }, skin: 'blue' },
  { tile: { x: 1, y: 11 }, skin: 'green' },
  { tile: { x: 15, y: 11 }, skin: 'yellow' },
  { tile: { x: 9, y: 5 }, skin: 'orange' },
];

const BACKYARD_JSON = 'sprites/atlases/backyard_atlas.json';
const BACKYARD_IMAGE = 'sprites/atlases/backyard_atlas_1x.png';
const GNOME_JSON = 'sprites/atlases/gnome_atlas.json';
const GNOME_IMAGE = 'sprites/atlases/gnome_atlas_1x.png';

/** What every frame draws with, set up once by loadArenaView. */
export interface ArenaView {
  ctx: CanvasRenderingContext2D;
  backyardSheet: SpriteSheet;
  gnomeSprites: GnomeSprites;

  /** Ground and the props that never change, drawn once; see drawStaticLayer. No breakables. */
  staticLayer: HTMLCanvasElement;
  /** Props drawn again every frame on top of the static layer, like the glinting pond. */
  animatedTiles: AnimatedTile[];
  birds: Bird[];
  ladybug: Ladybug;
  /** The rules: gnomes, breakables and pods. Breakables are drawn every frame, as blasts go. */
  match: Match;
}

/**
 * Loads the sprite sheets and sets up the backyard for drawing on `ctx`. Null when the browser
 * can't give a 2D context for one of the canvases drawn at load time.
 */
export async function loadArenaView(ctx: CanvasRenderingContext2D): Promise<ArenaView | null> {
  // Both downloads start at once; await waits until both are in.
  const [backyardSheet, gnomeSheet] = await Promise.all([
    SpriteSheet.load(BACKYARD_IMAGE, BACKYARD_JSON),
    SpriteSheet.load(GNOME_IMAGE, GNOME_JSON),
  ]);
  const match = new Match(BACKYARD, [PLAYER, ...BYSTANDERS], new SeededRandom(newMatchSeed()));
  const props = propsIn(BACKYARD);
  const { stillProps, animatedTiles } = splitAnimated(props, backyardSheet.animations);
  const staticLayer = drawStaticLayer(backyardSheet, stillProps);
  const gnomeSprites = GnomeSprites.build(gnomeSheet);
  if (staticLayer === null || gnomeSprites === null) {
    return null;
  }
  return {
    ctx,
    backyardSheet,
    gnomeSprites,
    staticLayer,
    animatedTiles,
    birds: birdsOn(props, backyardSheet.animations),
    ladybug: new Ladybug(LADYBUG_TILE.x, LADYBUG_TILE.y, backyardSheet.animations),
    match,
  };
}

/** A fresh seed for each match; later the server picks it, so every player gets the same one. */
function newMatchSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

/** A bird on every bird bath. */
function birdsOn(props: PlacedProp[], animations: Record<string, Animation>): Bird[] {
  return props
    .filter((prop) => prop.frame === BIRD_BATH)
    .map((prop) => new Bird(prop.x, prop.y, animations));
}

/**
 * Draws everything that doesn't change (ground and still props) once, onto a canvas that is
 * never shown.
 * Each frame then copies it in a single drawImage instead of drawing every tile again.
 * Returns null when the browser can't give a 2D context.
 */
function drawStaticLayer(sheet: SpriteSheet, stillProps: PlacedProp[]): HTMLCanvasElement | null {
  const staticLayer = document.createElement('canvas');
  // The whole arena, also when the screen only shows part of it.
  staticLayer.width = ARENA_SIZE.width;
  staticLayer.height = ARENA_SIZE.height;
  const ctx = staticLayer.getContext('2d');
  if (ctx == null) {
    return null;
  }
  ctx.imageSmoothingEnabled = false;

  drawGround(ctx, sheet, BACKYARD);
  for (const prop of stillProps) {
    sheet.drawFrame(ctx, prop.frame, prop.x * TILE, prop.y * TILE);
  }
  return staticLayer;
}

function drawGround(ctx: CanvasRenderingContext2D, sheet: SpriteSheet, map: ArenaMap): void {
  for (const [y, row] of map.grid.entries()) {
    for (const x of [...row].keys()) {
      sheet.drawFrame(ctx, 'grass_0', x * TILE, y * TILE);
    }
  }
}
