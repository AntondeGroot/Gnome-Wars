import { Gnome } from '../gnome/gnome';
import { Walls } from '../walls';
import { Blast, burst, hasFaded } from './blast';
import { hasBurntOut } from './fuse';
import { plantPod } from './plant-pod';
import { Pod } from './pod';

/** The pods on the lawn and the blasts they burst into, and when the player plants. No canvas. */
export class PodsOnLawn {
  /** In the order they were planted. */
  private pods: Pod[] = [];
  private blasts: Blast[] = [];
  private plantHeldLastTick = false;

  /** @param blastWalls what stops a blast, see Walls.forBlasts */
  constructor(private readonly blastWalls: Walls) {}

  get all(): readonly Pod[] {
    return this.pods;
  }

  get allBlasts(): readonly Blast[] {
    return this.blasts;
  }

  /**
   * One tick of the pods: faded blasts go, pods whose fuse ran out burst, then `planter` plants one
   * if the plant key just went down. Bursting first lets a gnome plant again on that same tick.
   */
  update(planter: Gnome, plantHeld: boolean, tick: number): void {
    this.blasts = this.blasts.filter((blast) => !hasFaded(blast, tick));
    this.burstPodsOutOfFuse(tick);
    this.plantOnPress(planter, plantHeld, tick);
  }

  private burstPodsOutOfFuse(tick: number): void {
    const bursting = this.pods.filter((pod) => hasBurntOut(pod, tick));
    this.pods = this.pods.filter((pod) => !hasBurntOut(pod, tick));
    this.blasts.push(...bursting.map((pod) => burst(pod, this.blastWalls, tick)));
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
