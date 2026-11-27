import LIVES_RULES from '../../../../shared/rules/lives.json';
import { Lives } from './lives';

const HIT_AT = 10;

describe('Lives', () => {
  it('blinks while protected, hidden for 4 ticks then shown for 4, and stays shown after', () => {
    const lives = new Lives();
    const drawnAtAge = (age: number): boolean => lives.isDrawnOn(HIT_AT + age);

    expect(lives.isDrawnOn(HIT_AT - 1)).toBe(true);
    lives.hit(HIT_AT);

    expect([0, 3, 4, 7, 8].map(drawnAtAge)).toEqual([false, false, true, true, false]);
    expect(drawnAtAge(LIVES_RULES.protectedTicks)).toBe(true);
  });
});
