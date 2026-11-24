import { Animation } from './animation';
import { AtlasFrame } from './atlas-frame';

export interface SpriteAtlas {
  frames: Record<string, AtlasFrame>;
  /** Pieces drawn from several frames, keyed by name (e.g. "pond"); the value describes them. */
  multi_tile: Record<string, string>;
  /** Animations by name, such as "pond_glint". The "_about" entry holds notes, not an animation. */
  animations: Record<string, Animation>;
}

/**
 * An atlas file as it is written. The atlases don't all use the same layout: the backyard and gnomes keeps its
 * frames under "frames", only the backyard has multi-tile
 * pieces and animations.
 */
interface AtlasFile {
  frames?: Record<string, AtlasFrame>;
  multi_tile?: Record<string, string>;
  animations?: Record<string, Animation>;
}

/** Turns any atlas file into a SpriteAtlas, with empty entries for what that file doesn't have. */
function toSpriteAtlas(file: AtlasFile): SpriteAtlas {
  return {
    frames: file.frames ?? {},
    multi_tile: file.multi_tile ?? {},
    animations: file.animations ?? {},
  };
}

/** A sprite sheet: one image holding many sprites, plus where each one sits in it. */
export class SpriteSheet {
  /** Loads the atlas data and image. A constructor can't await, so loading happens here. */
  static async load(imagePath: string, jsonPath: string): Promise<SpriteSheet> {
    const response = await fetch(jsonPath);
    const atlas = toSpriteAtlas(await response.json());

    const image = new Image();
    image.src = imagePath;
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
