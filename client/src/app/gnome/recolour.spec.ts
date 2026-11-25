import { paletteWithHat, TEMPLATE_KEYS } from './palette';
import { recolour } from './recolour';

describe('recolour', () => {
  it('repaints key-coloured pixels in the palette colour and leaves every other pixel alone', () => {
    // RGBA: an opaque pixel in the hat key colour (#ff0000), a see-through one in that same
    // colour, and an opaque one in a colour that isn't a key.
    const pixels = new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 0, 1, 2, 3, 255]);

    recolour(pixels, TEMPLATE_KEYS, paletteWithHat('#3f6fd8'));

    expect([...pixels]).toEqual([0x3f, 0x6f, 0xd8, 255, 255, 0, 0, 0, 1, 2, 3, 255]);
  });
});
