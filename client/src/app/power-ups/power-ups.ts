import POWER_UP_RULES from '../../../../shared/rules/power-ups.json';
import { Gnome } from '../gnome/gnome';
import { Blast, covers } from '../pods/blast';
import { GnomeStats } from '../gnome/gnome-stats';
import { RandomInts } from '../seeded-random';
import { nearestTile, Position, sameTile } from '../walls';

/** What a power-up gives: a longer blast, one more pod, or a faster walk. */
export type PowerUpKind = 'range' | 'pod' | 'speed';

/** A power-up lying on the lawn, waiting to be walked over. */
export interface PowerUp {
  readonly tile: Position;
  readonly kind: PowerUpKind;
}

const KINDS = POWER_UP_RULES.kinds as PowerUpKind[];
const PERCENT = 100;

/**
 * The power-ups lying on the lawn: dropped by destroyed breakables, taken by walking over them, and
 * destroyed by a blast that bursts over them.
 */
export class PowerUps {
  private lying: PowerUp[] = [];

  /** @param random seeded at match start, so every client drops the same power-ups */
  constructor(private readonly random: RandomInts) {}

  get all(): readonly PowerUp[] {
    return this.lying;
  }

  /**
   * Destroys the power-ups that blasts bursting this tick cover. Call it before dropAt, so a
   * power-up that a breakable drops survives the blast that broke it.
   */
  destroyUnder(newBlasts: readonly Blast[]): void {
    this.lying = this.lying.filter(
      (powerUp) => !newBlasts.some((blast) => covers(blast, powerUp.tile)),
    );
  }

  /** Where breakables were just destroyed: each drops a power-up dropPercent of the time. */
  dropAt(tiles: readonly Position[]): void {
    for (const tile of tiles) {
      if (this.random.nextInt(PERCENT) < POWER_UP_RULES.dropPercent) {
        this.lying.push({ tile, kind: KINDS[this.random.nextInt(KINDS.length)] });
      }
    }
  }

  /**
   * Every gnome still in whose centre is on a power-up takes it. Gnomes go in player order, so on a
   * tie the lower player number gets it.
   */
  pickUp(gnomes: readonly Gnome[]): void {
    for (const gnome of gnomes.filter((gnome) => !gnome.lives.isOut)) {
      const tile = nearestTile(gnome);
      const taken = this.lying.find((powerUp) => sameTile(powerUp.tile, tile));
      if (taken !== undefined) {
        apply(taken.kind, gnome.stats);
        this.lying = this.lying.filter((powerUp) => powerUp !== taken);
      }
    }
  }
}

function apply(kind: PowerUpKind, stats: GnomeStats): void {
  const effects: Record<PowerUpKind, () => void> = {
    range: () => stats.addBlastRange(),
    pod: () => stats.addPod(),
    speed: () => stats.addSpeed(),
  };
  effects[kind]();
}
