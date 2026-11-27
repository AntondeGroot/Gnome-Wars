import LIVES_RULES from '../../../../shared/rules/lives.json';

/** While protected, a gnome is hidden for this many ticks, then shown for as many: it blinks. */
const BLINK_TICKS = 4;

/**
 * A gnome's lives. A hit by a blast or an enemy takes one and protects it for `protectedTicks`, so
 * one blast can't take two. At none left it is out: it can't move or plant, and plays its knockout.
 */
export class Lives {
  private left = LIVES_RULES.startingLives;
  /** The tick of the latest hit, or null before the first. */
  private hitAt: number | null = null;

  get remaining(): number {
    return this.left;
  }

  get isOut(): boolean {
    return this.left === 0;
  }

  /** The tick the last life was lost, or null while the gnome still has lives. */
  get outAt(): number | null {
    return this.isOut ? this.hitAt : null;
  }

  /** Takes a life on `tick`, unless the gnome is out or still protected by an earlier hit. */
  hit(tick: number): void {
    if (this.isOut || this.isProtected(tick)) {
      return;
    }
    this.left--;
    this.hitAt = tick;
  }

  isProtected(tick: number): boolean {
    return this.hitAt !== null && tick - this.hitAt < LIVES_RULES.protectedTicks;
  }

  /** Whether to draw the gnome on `tick`: every other 4 ticks while protected, else always. */
  isDrawnOn(tick: number): boolean {
    if (this.hitAt === null || !this.isProtected(tick)) {
      return true;
    }
    return Math.floor((tick - this.hitAt) / BLINK_TICKS) % 2 === 1;
  }
}
