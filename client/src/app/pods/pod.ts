import { Gnome } from '../gnome/gnome';
import { Position } from '../walls';

/** A seed pod lying on the lawn, waiting for its fuse to run out. */
export interface Pod {
  /** The tile it lies on, in tiles (not units). */
  readonly tile: Position;
  /** The gnome that planted it; its pods count toward that gnome's limit. */
  readonly owner: Gnome;
  /** The tick it was planted on; the fuse counts from here. */
  readonly plantedAt: number;
  /**
   * How far it bursts: its gnome's blast range when it was planted. A range power-up picked up
   * later only makes the pods planted after it stronger.
   */
  readonly blastRange: number;
}
