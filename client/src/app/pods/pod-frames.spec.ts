import POD_RULES from '../../../../shared/rules/pods.json';
import { BlastCell } from '../game/rules/blast-cells';
import { Pod } from '../game/rules/pod';
import { Walls } from '../game/rules/walls';
import { Gnome } from '../gnome/gnome';
import { Blast, hasFaded } from './blast';
import { blastFrame, fuseFrame } from './pod-frames';

/** An 8 × 8 tile lawn without walls; the gnome is only there to own the pod. */
const OPEN_LAWN = Walls.of({
  grid: Array<string>(8).fill('........'),
  tiles: { '.': { walkable: true } },
});
const PLANTED_AT = 10;
const THIRD_OF_FUSE = POD_RULES.fuseTicks / 3;
const STARTED_AT = 10;
const THIRD_OF_BLAST = POD_RULES.blastTicks / 3;
const RIGHT_ARM: BlastCell = { tile: { x: 3, y: 2 }, part: 'arm', direction: 'right' };

describe('fuseFrame', () => {
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

describe('blastFrame', () => {
  it('fades through three frames, a third of the blast each, then is gone', () => {
    const blast: Blast = { cells: [RIGHT_ARM], startedAt: STARTED_AT };
    const frameAtAge = (age: number): string => blastFrame(RIGHT_ARM, blast, STARTED_AT + age);

    expect(frameAtAge(0)).toBe('blast_arm_r_0');
    expect(frameAtAge(THIRD_OF_BLAST - 1)).toBe('blast_arm_r_0');
    expect(frameAtAge(THIRD_OF_BLAST)).toBe('blast_arm_r_1');
    expect(frameAtAge(2 * THIRD_OF_BLAST - 1)).toBe('blast_arm_r_1');
    expect(frameAtAge(2 * THIRD_OF_BLAST)).toBe('blast_arm_r_2');
    expect(hasFaded(blast, STARTED_AT + POD_RULES.blastTicks - 1)).toBe(false);
    expect(hasFaded(blast, STARTED_AT + POD_RULES.blastTicks)).toBe(true);
  });
});
