import POD_RULES from '../../../../shared/rules/pods.json';
import { Direction } from '../direction';
import { Walls } from '../walls';
import { BlastCell, blastCells } from './blast-cells';
import { Pod } from './pod';

/** A burst pod's vine cross, fading away over `blastTicks`. */
export interface Blast {
  readonly cells: readonly BlastCell[];
  /** The tick the pod burst on; the fade counts from here. */
  readonly startedAt: number;
}

/** The atlas has three frames per vine piece, from full to faded. */
const FADE_FRAMES = 3;
/** The letter the atlas uses for each direction, as in blast_arm_r_0. */
const DIRECTION_LETTERS: Record<Direction, string> = { up: 'u', down: 'd', left: 'l', right: 'r' };

/** The blast of `pod` bursting on `tick`, as far as its owner's blast range reaches. */
export function burst(pod: Pod, walls: Walls, tick: number): Blast {
  return { cells: blastCells(pod.tile, pod.owner.stats.blastRange, walls), startedAt: tick };
}

/** The frame for one cell of `blast` on `tick`: each fade frame shows for a third of the blast. */
export function blastFrame(cell: BlastCell, blast: Blast, tick: number): string {
  const age = tick - blast.startedAt;
  const fade = Math.min(Math.floor((age * FADE_FRAMES) / POD_RULES.blastTicks), FADE_FRAMES - 1);
  const piece =
    cell.direction === undefined ? cell.part : `${cell.part}_${DIRECTION_LETTERS[cell.direction]}`;
  return `blast_${piece}_${fade}`;
}

/** Whether the blast has faded away completely. */
export function hasFaded(blast: Blast, tick: number): boolean {
  return tick - blast.startedAt >= POD_RULES.blastTicks;
}
