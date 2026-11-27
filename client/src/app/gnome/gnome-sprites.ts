import { SpriteSheet } from '../sprite-atlas';
import { nearestTile, TILE_UNITS } from '../walls';
import { Gnome } from './gnome';
import { knockoutStep } from './knockout';
import { HAT_COLOURS, Palette, paletteWithHat } from './palette';
import { buildSkinSheet } from './skin-sheet';

/** The knockout frames are 32 × 32 with the gnome's tile in the middle: 8 px around it. */
const KNOCKOUT_MARGIN = 8;

/** Draws gnomes in their own colours: the shadow from the gnome atlas, the gnome from its skin. */
export class GnomeSprites {
  private constructor(
    private readonly gnomeSheet: SpriteSheet,
    /** The gnome frames recoloured once per hat colour; see buildSkinSheet. */
    private readonly skinSheet: SpriteSheet,
  ) {}

  /** Recolours the gnome atlas once for every hat colour. Null when the browser can't give a 2D context. */
  static build(gnomeSheet: SpriteSheet): GnomeSprites | null {
    const skinSheet = buildSkinSheet(gnomeSheet, skinsByHat());
    return skinSheet === null ? null : new GnomeSprites(gnomeSheet, skinSheet);
  }

  /** Draws `gnome` as it looks on `tick`: blinking while protected, its knockout once out. */
  draw(ctx: CanvasRenderingContext2D, gnome: Gnome, tick: number): void {
    const outAt = gnome.lives.outAt;
    if (outAt !== null) {
      this.drawKnockout(ctx, gnome, tick - outAt);
      return;
    }
    if (!gnome.lives.isDrawnOn(tick)) {
      return;
    }
    // As the atlas says: the shadow at the gnome's position, the gnome 1 px higher so it stands on it.
    this.gnomeSheet.drawFrame(ctx, 'shadow', gnome.x, gnome.y);
    this.skinSheet.drawFrame(ctx, gnome.frameName, gnome.x, gnome.y - 1);
  }

  /** On the gnome's tile, whatever way it faced; the frames hold their own shadow. */
  private drawKnockout(ctx: CanvasRenderingContext2D, gnome: Gnome, ticksOut: number): void {
    const { frame, dx } = knockoutStep(ticksOut);
    const tile = nearestTile(gnome);
    const x = tile.x * TILE_UNITS - KNOCKOUT_MARGIN + dx;
    const y = tile.y * TILE_UNITS - KNOCKOUT_MARGIN;
    this.skinSheet.drawFrame(ctx, `${gnome.skin}/${frame}`, x, y);
  }
}

/** One palette per hat colour, named like the colour: "red", "blue", …. */
function skinsByHat(): Record<string, Palette> {
  return Object.fromEntries(
    Object.entries(HAT_COLOURS).map(([name, hat]) => [name, paletteWithHat(hat)]),
  );
}
