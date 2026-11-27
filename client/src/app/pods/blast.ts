import POD_RULES from '../../../../shared/rules/pods.json';
import { Position, sameTile } from '../game/rules/walls';
import { BlastCell, blastCells, BlastSurroundings } from '../game/rules/blast-cells';
import { Pod } from '../game/rules/pod';

/** A burst pod's vine cross, fading away over `blastTicks`. */
export interface Blast {
  readonly cells: readonly BlastCell[];
  /** The tick the pod burst on; the fade counts from here. */
  readonly startedAt: number;
}

/** The blast of `pod` bursting on `tick`, as far as the blast range it was planted with. */
export function burst(pod: Pod, surroundings: BlastSurroundings, tick: number): Blast {
  const cells = blastCells(pod.tile, pod.blastRange, surroundings);
  return { cells, startedAt: tick };
}

/** Whether the blast has faded away completely. */
export function hasFaded(blast: Blast, tick: number): boolean {
  return tick - blast.startedAt >= POD_RULES.blastTicks;
}

/** Whether the blast's vine lies on `tile`. */
export function covers(blast: Blast, tile: Position): boolean {
  return blast.cells.some((cell) => sameTile(cell.tile, tile));
}
