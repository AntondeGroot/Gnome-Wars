import { paletteWithHat, TEMPLATE_KEYS } from './palette';

describe('the template key colours', () => {
  it('are all different, so every template pixel belongs to exactly one palette entry', () => {
    const keyColours = Object.values(TEMPLATE_KEYS).map((hex) => hex.toLowerCase());

    expect(new Set(keyColours).size).toBe(keyColours.length);
  });
});

describe('paletteWithHat', () => {
  it('derives a darker and a lighter hat shade from the hat colour', () => {
    // #d63c3c is (214, 60, 60). 28% towards black: (154, 43, 43). 38% towards white:
    // 214 + 41 × 0.38 = 229.58 and 60 + 195 × 0.38 = 134.1, rounded to (230, 134, 134).
    const palette = paletteWithHat('#d63c3c');

    expect(palette.hat).toBe('#d63c3c');
    expect(palette.hat_dark).toBe('#9a2b2b');
    expect(palette.hat_light).toBe('#e68686');
  });
});
