import { Animation } from './animation';
import { AtlasFrame } from './atlas-frame';

const ATLAS_JSON = 'sprites/atlases/backyard_atlas.json';
const ATLAS_IMAGE = 'sprites/atlases/backyard_atlas_1x.png';

export interface SpriteAtlas {
  frames: Record<string, AtlasFrame>;
  /** Pieces drawn from several frames, keyed by name (e.g. "pond"); the value describes them. */
  multi_tile: Record<string, string>;
  /** Animations by name, such as "pond_glint". The "_about" entry holds notes, not an animation. */
  animations: Record<string, Animation>;
}

/** The backyard sprite sheet: one image holding every sprite, plus where each one sits in it. */
export class SpriteSheet {
  /** Loads the atlas data and image. A constructor can't await, so loading happens here. */
  static async load(): Promise<SpriteSheet> {
    const response = await fetch(ATLAS_JSON);
    const atlas: SpriteAtlas = await response.json();

    const image = new Image();
    image.src = ATLAS_IMAGE;
    await image.decode();

    return new SpriteSheet(image, atlas);
  }

  constructor(
    private readonly image: HTMLImageElement,
    private readonly atlas: SpriteAtlas,
  ) {}

  get animations(): Record<string, Animation> {
    return this.atlas.animations;
  }

  /** Copies the frame called `name` out of the sheet onto the canvas, top-left corner at (x, y). */
  drawFrame(ctx: CanvasRenderingContext2D, name: string, x: number, y: number): void {
    const frame = this.frameNamed(name);
    ctx.drawImage(this.image, frame.x, frame.y, frame.w, frame.h, x, y, frame.w, frame.h);
  }

  /** Like drawFrame, but mirrored left to right, so a sprite facing right faces left. */
  drawFrameMirrored(ctx: CanvasRenderingContext2D, name: string, x: number, y: number): void {
    const frame = this.frameNamed(name);
    ctx.save();
    // Move the origin to the frame's right edge and flip the x axis, so the frame draws leftwards.
    ctx.translate(x + frame.w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(this.image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
    ctx.restore();
  }

  private frameNamed(name: string): AtlasFrame {
    const frame = this.atlas.frames[name];
    if (frame === undefined) {
      throw new Error(`Unknown frame: ${name}`);
    }
    return frame;
  }
}
