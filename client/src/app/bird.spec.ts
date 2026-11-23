import { Animation } from './animation';
import { Bird } from './bird';

/** Always the shortest gap, so every event comes exactly at the start of its every_ticks range. */
const SHORTEST_GAP = (): number => 0;

/** Calls update for every tick from `first` up to and including `last`, like the game loop does. */
function runTicks(bird: Bird, first: number, last: number): void {
  for (let tick = first; tick <= last; tick++) {
    bird.update(tick);
  }
}

describe('Bird', () => {
  it('perches on the right rim after a hop, and hops back mirrored', () => {
    const animations: Record<string, Animation> = {
      bird_perch: { frames: ['bird_perch_left'], loop: true },
      // Far out of reach, so only hops happen.
      bird_dip: { frames: [['bird_dip_1', 4]], event: { every_ticks: [10_000, 10_000] } },
      bird_hop: { frames: [['bird_hop', 8]], event: { every_ticks: [10, 10] } },
    };
    const bird = new Bird(0, 0, animations, SHORTEST_GAP);

    // The first hop plays ticks 10 to 17, then the bird lands.
    runTicks(bird, 1, 18);
    expect(bird.frameAt(18)).toMatchObject({ name: 'bird_perch_right', flipX: false });

    // 10 ticks after landing it hops back, so the left-to-right hop is drawn mirrored.
    runTicks(bird, 19, 28);
    expect(bird.frameAt(28)).toMatchObject({ name: 'bird_hop', flipX: true });
  });
});
