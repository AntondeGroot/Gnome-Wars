import { Gnome } from '../gnome/gnome';
import { hasBurntOut } from './fuse';
import { plantPod } from './plant-pod';
import { Pod } from './pod';

/** The pods lying on the lawn, and when the player plants a new one. Plain state: no canvas. */
export class PodsOnLawn {
  /** In the order they were planted. */
  private pods: Pod[] = [];
  private plantHeldLastTick = false;

  get all(): readonly Pod[] {
    return this.pods;
  }

  /**
   * One tick of the pods: those whose fuse ran out disappear, then `planter` plants one if the
   * plant key just went down. Clearing first lets a gnome plant again on the tick its pod is gone.
   */
  update(planter: Gnome, plantHeld: boolean, tick: number): void {
    this.pods = this.pods.filter((pod) => !hasBurntOut(pod, tick));
    this.plantOnPress(planter, plantHeld, tick);
  }

  /** Plants on the tick the plant key goes down; holding it plants no more. */
  private plantOnPress(planter: Gnome, plantHeld: boolean, tick: number): void {
    const pressed = plantHeld && !this.plantHeldLastTick;
    this.plantHeldLastTick = plantHeld;
    if (!pressed) {
      return;
    }
    const pod = plantPod(planter, this.pods, tick);
    if (pod !== null) {
      this.pods.push(pod);
    }
  }
}
