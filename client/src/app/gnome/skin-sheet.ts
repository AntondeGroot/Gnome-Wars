import { AtlasFrame } from '../atlas-frame';
import { SpriteSheet } from '../sprite-atlas';
import { Palette, TEMPLATE_KEYS } from './palette';
import { recolour } from './recolour';

const TEMPLATE_PREFIX = 'template/';

type TemplateFrame = [name: string, frame: AtlasFrame];

/**
 * A sheet holding every template frame once per skin, recoloured with that skin's palette and named
 * like the atlas's own skins: "blue/down_idle". Built once at load, so drawing any skin costs no
 * more than drawing a frame from a file. Null when the browser can't give a 2D context.
 */
export function buildSkinSheet(
  gnomeSheet: SpriteSheet,
  skins: Record<string, Palette>,
): SpriteSheet | null {
  const templates = gnomeSheet.framesStartingWith(TEMPLATE_PREFIX);
  const rowWidth = templates.reduce((width, [, frame]) => width + frame.w, 0);
  const rowHeight = Math.max(...templates.map(([, frame]) => frame.h));
  const skinRows = Object.entries(skins);

  const canvas = document.createElement('canvas');
  canvas.width = rowWidth;
  canvas.height = rowHeight * skinRows.length;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return null;
  }

  let frames: Record<string, AtlasFrame> = {};
  for (const [row, [skin, palette]] of skinRows.entries()) {
    const y = row * rowHeight;
    frames = { ...frames, ...drawTemplateRow(ctx, gnomeSheet, templates, skin, y) };
    const pixels = ctx.getImageData(0, y, rowWidth, rowHeight);
    recolour(pixels.data, TEMPLATE_KEYS, palette);
    ctx.putImageData(pixels, 0, y);
  }
  return new SpriteSheet(canvas, { frames, multi_tile: {}, animations: {} });
}

/** Draws the template frames side by side at height `y`; returns where each one sits as `skin`/…. */
function drawTemplateRow(
  ctx: CanvasRenderingContext2D,
  gnomeSheet: SpriteSheet,
  templates: TemplateFrame[],
  skin: string,
  y: number,
): Record<string, AtlasFrame> {
  const frames: Record<string, AtlasFrame> = {};
  let x = 0;
  for (const [name, frame] of templates) {
    gnomeSheet.drawFrame(ctx, name, x, y);
    frames[`${skin}/${name.slice(TEMPLATE_PREFIX.length)}`] = { x, y, w: frame.w, h: frame.h };
    x += frame.w;
  }
  return frames;
}
