/** A colour as red, green and blue, each 0 to 255. */
export type Rgb = [red: number, green: number, blue: number];

/** '#d63c3c' as [214, 60, 60]. */
export function rgbFromHex(hex: string): Rgb {
  const digits = hex.replace('#', '');
  return [0, 2, 4].map((start) => parseInt(digits.slice(start, start + 2), 16)) as Rgb;
}

/** [214, 60, 60] as '#d63c3c'. */
export function hexFromRgb(rgb: Rgb): string {
  return '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('');
}

/**
 * `colour` moved `amount` (0 to 1) of the way towards `target`, per channel: mixing 28% towards
 * black gives a 28% darker shade. The same formula as the gnome colour lab, so a palette tried
 * there looks the same in the game.
 */
export function mix(colour: string, target: string, amount: number): string {
  const from = rgbFromHex(colour);
  const to = rgbFromHex(target);
  return hexFromRgb(from.map((channel, i) => Math.round(channel + (to[i] - channel) * amount)) as Rgb);
}
