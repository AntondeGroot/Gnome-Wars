import { Breakables } from '../breakables';
import { Gnome } from '../gnome/gnome';
import { Obstacles, Position, TILE_UNITS, Walls } from '../walls';
import { Blast, burst, hasFaded } from './blast';
import { hasBurntOut } from './fuse';
import { plantPod } from './plant-pod';
import { Pod } from './pod';

/** The pods on the lawn and the blasts they burst into, and when the player plants. No canvas. */
export class PodsOnLawn {
  /** In the order they were planted. */
  private pods: Pod[] = [];
  private blasts: Blast[] = [];
  /** Pods whose planter hasn't fully stepped off yet: it may still walk off, nobody may walk on. */
  private readonly plantersStillOn = new Set<Pod>();
  private plantHeldLastTick = false;

  /**
   * @param blastWalls what stops a blast, see Walls.forBlasts
   * @param breakables what blasts destroy; none by default
   */
  constructor(
    private readonly blastWalls: Walls,
    private readonly breakables = Breakables.none(),
  ) {}

  get all(): readonly Pod[] {
    return this.pods;
  }

  get allBlasts(): readonly Blast[] {
    return this.blasts;
  }

  /** The pods in `gnome`'s way: all of them, except one it planted and hasn't stepped off yet. */
  obstaclesFor(gnome: Gnome): Obstacles {
    return {
      blocks: (position) =>
        this.pods.some((pod) => overlapsTile(position, pod.tile) && !this.isStillOn(gnome, pod)),
    };
  }

  /**
   * One tick of the pods, after the gnomes moved: planters who stepped off their pod can no longer
   * walk back on, faded blasts go, pods whose fuse ran out burst, then `planter` plants one if the
   * plant key just went down. Bursting first lets a gnome plant again on that same tick.
   */
  update(planter: Gnome, plantHeld: boolean, tick: number): void {
    this.forgetPlantersWhoLeft();
    this.blasts = this.blasts.filter((blast) => !hasFaded(blast, tick));
    this.burstPodsOutOfFuse(tick);
    this.plantOnPress(planter, plantHeld, tick);
  }

  private isStillOn(gnome: Gnome, pod: Pod): boolean {
    return pod.owner === gnome && this.plantersStillOn.has(pod);
  }

  private forgetPlantersWhoLeft(): void {
    for (const pod of this.plantersStillOn) {
      if (!overlapsTile(pod.owner, pod.tile)) {
        this.plantersStillOn.delete(pod);
      }
    }
  }

  private burstPodsOutOfFuse(tick: number): void {
    const bursting = this.pods.filter((pod) => hasBurntOut(pod, tick));
    this.pods = this.pods.filter((pod) => !hasBurntOut(pod, tick));
    const surroundings = { walls: this.blastWalls, breakables: this.breakables };
    const newBlasts = bursting.map((pod) => burst(pod, surroundings, tick));
    // Only after every blast of this tick is worked out, so none reaches past another's breakable.
    newBlasts.forEach((blast) => this.destroyBreakablesUnder(blast));
    this.blasts.push(...newBlasts);
    bursting.forEach((pod) => this.plantersStillOn.delete(pod));
  }

  private destroyBreakablesUnder(blast: Blast): void {
    for (const cell of blast.cells) {
      this.breakables.destroy(cell.tile);
    }
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
      this.plantersStillOn.add(pod);
    }
  }
}

/** Whether a one-tile box at `position`, in units, overlaps `tile`. */
function overlapsTile(position: Position, tile: Position): boolean {
  const apartX = Math.abs(position.x - tile.x * TILE_UNITS);
  const apartY = Math.abs(position.y - tile.y * TILE_UNITS);
  return apartX < TILE_UNITS && apartY < TILE_UNITS;
}
