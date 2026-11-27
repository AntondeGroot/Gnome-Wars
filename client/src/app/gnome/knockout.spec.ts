import { knockoutStep } from './knockout';

describe('knockoutStep', () => {
  it('follows the atlas timing, shakes while cracking, then holds the marker', () => {
    // The atlas: flash, two ceramic frames (3 ticks each), statue (15), crack_1 (6), crack_2 shaken
    // right then left (3 each), five crumble frames (3 each), hat_lands (4): 55 ticks in all.
    expect(knockoutStep(0)).toEqual({ frame: 'knockout_flash', ticks: 3, dx: 0 });
    expect(knockoutStep(8).frame).toBe('knockout_ceramic_2');
    expect(knockoutStep(9).frame).toBe('knockout_statue');
    expect(knockoutStep(30)).toEqual({ frame: 'knockout_crack_2', ticks: 3, dx: 1 });
    expect(knockoutStep(33)).toEqual({ frame: 'knockout_crack_2', ticks: 3, dx: -1 });
    expect(knockoutStep(54).frame).toBe('knockout_hat_lands');
    expect(knockoutStep(55).frame).toBe('knockout_marker');
    expect(knockoutStep(10_000).frame).toBe('knockout_marker');
  });
});
