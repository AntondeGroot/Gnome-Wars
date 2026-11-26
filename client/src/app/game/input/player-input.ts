import { Injectable } from '@angular/core';
import { Direction } from '../../direction';
import { Keyboard } from '../../keyboard';

/** What the touch controls hold right now; written by the controls, read by the tick. */
export class TouchInput {
  direction: Direction | null = null;
  podHeld = false;

  release(): void {
    this.direction = null;
    this.podHeld = false;
  }
}

/**
 * The player's controls, whatever they come from: the keyboard and the touch controls write held
 * state, and the tick samples it. Held state, not presses, so the game and later the server see
 * the same thing every tick.
 */
@Injectable({ providedIn: 'root' })
export class PlayerInput {
  readonly keyboard = new Keyboard();
  readonly touch = new TouchInput();

  /** The way the player steers: the keyboard when a steering key is held, else the thumbstick. */
  direction(): Direction | null {
    return this.keyboard.direction() ?? this.touch.direction;
  }

  /** Whether a plant key or the plant button is held. */
  podHeld(): boolean {
    return this.keyboard.podHeld() || this.touch.podHeld;
  }
}
