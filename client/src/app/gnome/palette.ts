import gnomeAtlas from '../../../public/sprites/atlases/gnome_atlas.json';
import { mix } from '../colour';

/**
 * The colours a gnome's look is picked from, as '#rrggbb'. A player picks these, for example a
 * hat colour, or any of them to tell gnomes apart with colour blindness; the shades follow.
 */
export interface BaseColours {
  outline: string;
  hat: string;
  skin: string;
  nose: string;
  beard: string;
  tunic: string;
  belt: string;
  boots: string;
}

/** Every colour the gnome template is drawn with: the base colours plus their shades. */
export interface Palette extends BaseColours {
  hat_dark: string;
  hat_light: string;
  ear: string;
  beard_shade: string;
  tunic_shade: string;
}

/** The flat colours the template frames are drawn in, one per palette entry. */
export const TEMPLATE_KEYS: Palette = gnomeAtlas.keys;

/** Everything but the hat: the outfit of the atlas's red gnome. */
export const DEFAULT_OUTFIT: Omit<BaseColours, 'hat'> = gnomeAtlas.skins.red;

/** The hat colours of the colour lab, by name. */
export const HAT_COLOURS = {
  red: '#d63c3c',
  purple: '#7b4fd6',
  blue: '#3f6fd8',
  green: '#3f9a4a',
  yellow: '#e8b830',
  orange: '#e8742e',
};

/** The full palette for `base`, with the shades derived by the rules in the atlas's "derive". */
export function withShades(base: BaseColours): Palette {
  return {
    ...base,
    hat_dark: mix(base.hat, '#000000', 0.28),
    hat_light: mix(base.hat, '#ffffff', 0.38),
    ear: mix(base.skin, '#7a3a1a', 0.18),
    beard_shade: mix(base.beard, '#2a2a2a', 0.13),
    tunic_shade: mix(base.tunic, '#000000', 0.23),
  };
}

/** The palette of a gnome in the default outfit with a `hat` coloured hat. */
export function paletteWithHat(hat: string): Palette {
  return withShades({ ...DEFAULT_OUTFIT, hat });
}
