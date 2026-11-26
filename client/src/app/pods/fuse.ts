import POD_RULES from '../../../../shared/rules/pods.json';
import { Pod } from './pod';

/** The pod's frames in the backyard atlas, green → yellow → pink as the fuse burns down. */
const FUSE_FRAMES = ['bomb_0', 'bomb_1', 'bomb_2'];

/** The frame for `pod` on `tick`: each frame shows for a third of the fuse. */
export function fuseFrame(pod: Pod, tick: number): string {
  const frame = Math.floor((ageOf(pod, tick) * FUSE_FRAMES.length) / POD_RULES.fuseTicks);
  return FUSE_FRAMES[Math.min(frame, FUSE_FRAMES.length - 1)];
}

/** Whether the fuse has run out. The pod then disappears; in step E2 it bursts instead. */
export function hasBurntOut(pod: Pod, tick: number): boolean {
  return ageOf(pod, tick) >= POD_RULES.fuseTicks;
}

function ageOf(pod: Pod, tick: number): number {
  return tick - pod.plantedAt;
}
