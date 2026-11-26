import { pickDirection } from './pick-direction';

describe('pickDirection', () => {
  it('keeps the current axis while the other one leads by less than the margin', () => {
    // Walking right, the thumb drifts down: 0.6 down beats 0.5 across, but 0.5 ≥ 0.75 × 0.6, so it
    // stays right. The same the other way round, walking up.
    expect(pickDirection(0.5, 0.6, 'right')).toBe('right');
    expect(pickDirection(0.6, -0.5, 'up')).toBe('up');
  });

  it('switches axis once the other one leads by more than the margin', () => {
    // Walking right, the thumb moves further down: 0.4 across is below 0.75 × 0.6 = 0.45, so it
    // turns down. Walking up, the thumb moves further right: 0.4 up is below 0.45, so it turns right.
    expect(pickDirection(0.4, 0.6, 'right')).toBe('down');
    expect(pickDirection(0.6, -0.4, 'up')).toBe('right');
  });

  it('goes left or right on an exact diagonal from standing still', () => {
    // Neither axis leads, so the tie goes to the horizontal one, towards the side of the thumb.
    expect(pickDirection(0.5, 0.5, null)).toBe('right');
    expect(pickDirection(0.5, -0.5, null)).toBe('right');
    expect(pickDirection(-0.5, 0.5, null)).toBe('left');
    expect(pickDirection(-0.5, -0.5, null)).toBe('left');
  });

  it('steers the way the thumb points, with up towards the top of the screen', () => {
    // Slightly off the axis, so each one is a real pick, not a tie. Screen y grows downward.
    expect(pickDirection(0.1, -0.8, null)).toBe('up');
    expect(pickDirection(-0.1, 0.8, null)).toBe('down');
    expect(pickDirection(-0.8, 0.1, null)).toBe('left');
    expect(pickDirection(0.8, -0.1, null)).toBe('right');
  });

  it('stands still inside the dead zone, even while walking, and steers from its edge on', () => {
    // (0.2, 0.2) is 0.28 from the centre, inside the 0.33 dead zone, so walking right stops.
    expect(pickDirection(0.2, 0.2, 'right')).toBeNull();
    expect(pickDirection(0, 0, null)).toBeNull();
    // Exactly on the edge already steers.
    expect(pickDirection(0.33, 0, null)).toBe('right');
  });
});
