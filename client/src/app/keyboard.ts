import { Direction } from './direction';
import { HeldKeys } from './held-keys';
import { directionFrom, STEERING_KEYS } from './keyboard-direction';

// The keys the game uses, by event.code. Their browser default (scrolling the page) is blocked.
const GAME_KEYS = STEERING_KEYS;

/**
 * The keyboard as the game sees it: key events only record which keys are held, and the tick asks
 * which way they steer. Moving in the key handler instead would tie a gnome's speed to the
 * keyboard's repeat rate.
 */
export class Keyboard {
  private readonly heldKeys = new HeldKeys();

  // event.code names the physical key ('KeyD'), the same with or without Shift and on any keyboard
  // layout; event.key would give 'd' on press and 'D' on a release with Shift held, so D would stick.
  keyDown(event: KeyboardEvent): void {
    if (GAME_KEYS.has(event.code)) {
      event.preventDefault();
    }
    this.heldKeys.press(event.code);
  }

  keyUp(event: KeyboardEvent): void {
    this.heldKeys.release(event.code);
  }

  /** A key released while another window has focus never sends keyup here, so forget them all. */
  forgetHeldKeys(): void {
    this.heldKeys.clear();
  }

  /** The way the held keys steer, or null when none of them steers. */
  direction(): Direction | null {
    return directionFrom(this.heldKeys);
  }
}
