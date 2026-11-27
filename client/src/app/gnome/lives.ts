import LIVES_RULES from '../../../../shared/rules/lives.json';

/**
 * A gnome's lives. A hit by a blast or an enemy takes one and protects it for `protectedTicks`, so
 * one blast can't take two. At none left it is out: it can't move or plant, and plays its knockout.
 */
export class Lives {
  private left = LIVES_RULES.startingLives;
  private _hitAt: number | null = null;

  /** The tick of the latest hit, or null before the first. */
  get hitAt(): number | null {
    return this._hitAt;
  }

  get remaining(): number {
    return this.left;
  }

  get isOut(): boolean {
    return this.left === 0;
  }

  /** The tick the last life was lost, or null while the gnome still has lives. */
  get outAt(): number | null {
    return this.isOut ? this._hitAt : null;
  }

  /** Takes a life on `tick`, unless the gnome is out or still protected by an earlier hit. */
  hit(tick: number): void {
    if (this.isOut || this.isProtected(tick)) {
      return;
    }
    this.left--;
    this._hitAt = tick;
  }

  isProtected(tick: number): boolean {
    return this._hitAt !== null && tick - this._hitAt < LIVES_RULES.protectedTicks;
  }
}
