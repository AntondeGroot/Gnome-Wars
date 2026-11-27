import POD_RULES from '../../../../shared/rules/pods.json';
import { BlastCell } from '../game/rules/blast-cells';
import { Direction } from '../game/rules/direction';
import { Pod } from '../game/rules/pod';
import { Blast } from './blast';

/** The pod's frames in the backyard atlas, green → yellow → pink as the fuse burns down. */
const FUSE_FRAMES = ['bomb_0', 'bomb_1', 'bomb_2'];
/** The atlas has three frames per vine piece, from full to faded. */
const FADE_FRAMES = 3;
/** The letter the atlas uses for each direction, as in blast_arm_r_0. */
const DIRECTION_LETTERS: Record<Direction, string> = { up: 'u', down: 'd', left: 'l', right: 'r' };

/** The frame for `pod` on `tick`: each frame shows for a third of the fuse. */
export function fuseFrame(pod: Pod, tick: number): string {
  const age = tick - pod.plantedAt;
  const frame = Math.floor((age * FUSE_FRAMES.length) / POD_RULES.fuseTicks);
  return FUSE_FRAMES[Math.min(frame, FUSE_FRAMES.length - 1)];
}

/** The frame for one cell of `blast` on `tick`: each fade frame shows for a third of the blast. */
export function blastFrame(cell: BlastCell, blast: Blast, tick: number): string {
  const age = tick - blast.startedAt;
  const fade = Math.min(Math.floor((age * FADE_FRAMES) / POD_RULES.blastTicks), FADE_FRAMES - 1);
  const piece =
    cell.direction === undefined ? cell.part : `${cell.part}_${DIRECTION_LETTERS[cell.direction]}`;
  return `blast_${piece}_${fade}`;
}
