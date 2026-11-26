import { SpriteSheet } from '../sprite-atlas';
import { TILE_UNITS } from '../walls';
import { blastFrame } from './blast';
import { fuseFrame } from './fuse';
import { PodsOnLawn } from './pods-on-lawn';

/**
 * Draws the pods and their blasts on the ground, under everything that walks or flies, so a gnome
 * stands in front of its pod.
 */
export function drawPods(
  ctx: CanvasRenderingContext2D,
  backyardSheet: SpriteSheet,
  pods: PodsOnLawn,
  tick: number,
): void {
  for (const pod of pods.all) {
    const { x, y } = pod.tile;
    backyardSheet.drawFrame(ctx, fuseFrame(pod, tick), x * TILE_UNITS, y * TILE_UNITS);
  }
  for (const blast of pods.allBlasts) {
    for (const cell of blast.cells) {
      const { x, y } = cell.tile;
      backyardSheet.drawFrame(ctx, blastFrame(cell, blast, tick), x * TILE_UNITS, y * TILE_UNITS);
    }
  }
}
