import { Gnome } from '../gnome/gnome';
import { Position, TILE_UNITS } from '../walls';
import { Pod } from './pod';

/**
 * A pod planted by `gnome` on `tick`, or null when it may not plant one: it already has as many
 * pods out as its limit, or a pod already lies on its tile. The caller adds the pod to the list.
 */
export function plantPod(gnome: Gnome, pods: readonly Pod[], tick: number): Pod | null {
  const tile = nearestTile(gnome);
  if (podsOwnedBy(gnome, pods) >= gnome.stats.podLimit || isTaken(tile, pods)) {
    return null;
  }
  return { tile, owner: gnome, plantedAt: tick };
}

/** The tile the gnome mostly stands on: halfway between two tiles, it rounds to the next one. */
function nearestTile(gnome: Gnome): Position {
  return { x: Math.round(gnome.x / TILE_UNITS), y: Math.round(gnome.y / TILE_UNITS) };
}

function podsOwnedBy(gnome: Gnome, pods: readonly Pod[]): number {
  return pods.filter((pod) => pod.owner === gnome).length;
}

function isTaken(tile: Position, pods: readonly Pod[]): boolean {
  return pods.some((pod) => pod.tile.x === tile.x && pod.tile.y === tile.y);
}
