import POD_RULES from '../../../../shared/rules/pods.json';
import { Gnome } from '../gnome/gnome';
import { Walls } from '../walls';
import { fuseFrame } from './fuse';
import { Pod } from './pod';

/** An 8 × 8 tile lawn without walls; the gnome is only there to own the pod. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
  legend: {},
  walkable: ['.'],
});
const PLANTED_AT = 10;
const THIRD_OF_FUSE = POD_RULES.fuseTicks / 3;

describe('fuse', () => {
  it('shows each frame for a third of the fuse, from the tick the pod is planted', () => {
    const pod: Pod = {
      tile: { x: 2, y: 3 },
      owner: new Gnome(32, 48, OPEN_LAWN),
      plantedAt: PLANTED_AT,
      blastRange: 1,
    };
    const frameAtAge = (age: number): string => fuseFrame(pod, PLANTED_AT + age);

    expect(frameAtAge(0)).toBe('bomb_0');
    expect(frameAtAge(THIRD_OF_FUSE - 1)).toBe('bomb_0');
    expect(frameAtAge(THIRD_OF_FUSE)).toBe('bomb_1');
    expect(frameAtAge(2 * THIRD_OF_FUSE - 1)).toBe('bomb_1');
    expect(frameAtAge(2 * THIRD_OF_FUSE)).toBe('bomb_2');
    expect(frameAtAge(POD_RULES.fuseTicks - 1)).toBe('bomb_2');
  });
});
