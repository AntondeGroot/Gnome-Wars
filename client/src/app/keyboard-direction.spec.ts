import { HeldKeys } from './held-keys';
import { directionFrom } from './keyboard-direction';

/** A HeldKeys with the given keys pressed, in that order. */
function holding(...keys: string[]): HeldKeys {
  const heldKeys = new HeldKeys();
  keys.forEach((key) => heldKeys.press(key));
  return heldKeys;
}

describe('directionFrom', () => {
  it('picks up when up and another direction are held, whichever was pressed first', () => {
    expect(directionFrom(holding('ArrowLeft', 'ArrowUp'))).toBe('up');
  });

  it('steers the way of the one arrow key held', () => {
    expect(directionFrom(holding('ArrowUp'))).toBe('up');
    expect(directionFrom(holding('ArrowDown'))).toBe('down');
    expect(directionFrom(holding('ArrowLeft'))).toBe('left');
    expect(directionFrom(holding('ArrowRight'))).toBe('right');
  });

  it('steers the same way with WASD as with the arrow keys', () => {
    expect(directionFrom(holding('KeyW'))).toBe('up');
    expect(directionFrom(holding('KeyS'))).toBe('down');
    expect(directionFrom(holding('KeyA'))).toBe('left');
    expect(directionFrom(holding('KeyD'))).toBe('right');
  });

  it('gives no direction when no steering key is held', () => {
    expect(directionFrom(holding())).toBeNull();
    expect(directionFrom(holding('Space'))).toBeNull();
  });
});
