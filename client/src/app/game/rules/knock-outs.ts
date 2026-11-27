import { Gnome } from '../../gnome/gnome';
import { nearestTile } from './walls';
import { Blast, covers } from '../../pods/blast';

/**
 * Hits every gnome standing in a blast: one whose centre is on a tile the vine covers. Its lives
 * decide what a hit does; see Lives.
 */
export function hitGnomesInBlasts(
  gnomes: readonly Gnome[],
  blasts: readonly Blast[],
  tick: number,
): void {
  for (const gnome of gnomes) {
    const tile = nearestTile(gnome);
    if (blasts.some((blast) => covers(blast, tile))) {
      gnome.lives.hit(tick);
    }
  }
}
