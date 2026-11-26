import STATS_LIMITS from '../../../../shared/rules/gnome-stats.json';

export class GnomeStats {
  podLimit: number = STATS_LIMITS.podLimit.min;
  blastRange: number = STATS_LIMITS.blastRange.min;
  unitsPerSecond: number = STATS_LIMITS.unitsPerSecond.min;

  addPod(): void {
    this.podLimit = Math.min(this.podLimit + 1, STATS_LIMITS.podLimit.max);
  }

  // + 10, causes a 33,3% increase in speed per bonus
  addSpeed(): void {
    this.unitsPerSecond = Math.min(this.unitsPerSecond + 10, STATS_LIMITS.unitsPerSecond.max);
  }

  addBlastRange(): void {
    this.blastRange = Math.min(this.blastRange + 1, STATS_LIMITS.blastRange.max);
  }
}
