import { Gnome } from '../gnome/gnome';
import { nearestTile, Position, sameTile } from '../walls';
import { Pod } from './pod';

/**
 * A pod planted by `gnome` on `tick`, or null when it may not plant one: it is out, it already has
 * as many pods out as its limit, or a pod already lies on its tile. The caller adds the pod.
 */
export function plantPod(gnome: Gnome, pods: readonly Pod[], tick: number): Pod | null {
  const tile = nearestTile(gnome);
  const atLimit = podsOwnedBy(gnome, pods) >= gnome.stats.podLimit;
  if (gnome.lives.isOut || atLimit || isTaken(tile, pods)) {
    return null;
  }
  return { tile, owner: gnome, plantedAt: tick, blastRange: gnome.stats.blastRange };
}

function podsOwnedBy(gnome: Gnome, pods: readonly Pod[]): number {
  return pods.filter((pod) => pod.owner === gnome).length;
}

function isTaken(tile: Position, pods: readonly Pod[]): boolean {
  return pods.some((pod) => sameTile(pod.tile, tile));
}
