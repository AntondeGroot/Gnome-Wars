import { SpriteSheet } from '../sprite-atlas';
import { Gnome } from './gnome';
import { HAT_COLOURS, Palette, paletteWithHat } from './palette';
import { buildSkinSheet } from './skin-sheet';

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

  draw(ctx: CanvasRenderingContext2D, gnome: Gnome): void {
    // As the atlas says: the shadow at the gnome's position, the gnome 1 px higher so it stands on it.
    this.gnomeSheet.drawFrame(ctx, 'shadow', gnome.x, gnome.y);
    this.skinSheet.drawFrame(ctx, gnome.frameName, gnome.x, gnome.y - 1);
  }
}

/** One palette per hat colour, named like the colour: "red", "blue", …. */
function skinsByHat(): Record<string, Palette> {
  return Object.fromEntries(
    Object.entries(HAT_COLOURS).map(([name, hat]) => [name, paletteWithHat(hat)]),
  );
}
