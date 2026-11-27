import POD_RULES from '../../../../shared/rules/pods.json';
import { Pod } from '../game/rules/pod';

/** Whether the fuse has run out, so the pod bursts. */
export function hasBurntOut(pod: Pod, tick: number): boolean {
  return tick - pod.plantedAt >= POD_RULES.fuseTicks;
}
