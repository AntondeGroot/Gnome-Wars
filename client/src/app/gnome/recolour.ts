import { Rgb, rgbFromHex } from '../colour';
import { Palette } from './palette';

const BYTES_PER_PIXEL = 4;

/**
 * Repaints template pixels in place: every pixel in one of the `keys` colours becomes the
 * `palette` colour for the same entry. `pixels` holds RGBA bytes, as in ImageData.data.
 * Transparent pixels and colours that aren't keys stay as they are.
 */
export function recolour(pixels: Uint8ClampedArray, keys: Palette, palette: Palette): void {
  const swaps = swapsByKeyColour(keys, palette);
  for (let i = 0; i < pixels.length; i += BYTES_PER_PIXEL) {
    const alpha = pixels[i + 3];
    const swap = alpha === 0 ? undefined : swaps.get(packed([pixels[i], pixels[i + 1], pixels[i + 2]]));
    if (swap !== undefined) {
      pixels.set(swap, i);
    }
  }
}

/** For every key colour, packed into one number, the colour that replaces it. */
function swapsByKeyColour(keys: Palette, palette: Palette): Map<number, Rgb> {
  const entries = Object.keys(keys) as (keyof Palette)[];
  return new Map(entries.map((entry) => [packed(rgbFromHex(keys[entry])), rgbFromHex(palette[entry])]));
}

function packed([red, green, blue]: Rgb): number {
  return (red << 16) | (green << 8) | blue;
}
