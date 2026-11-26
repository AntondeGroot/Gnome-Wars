import STATS_LIMITS from '../../../../shared/rules/gnome-stats.json';

/** Units per second each speed power-up adds: +33% of the starting 30. */
const SPEED_STEP = 10;

export class GnomeStats {
  podLimit: number = STATS_LIMITS.podLimit.min;
  blastRange: number = STATS_LIMITS.blastRange.min;
  unitsPerSecond: number = STATS_LIMITS.unitsPerSecond.min;

  addPod(): void {
    this.podLimit = Math.min(this.podLimit + 1, STATS_LIMITS.podLimit.max);
  }

  addSpeed(): void {
    this.unitsPerSecond = Math.min(this.unitsPerSecond + SPEED_STEP, STATS_LIMITS.unitsPerSecond.max);
  }

  addBlastRange(): void {
    this.blastRange = Math.min(this.blastRange + 1, STATS_LIMITS.blastRange.max);
  }
}
