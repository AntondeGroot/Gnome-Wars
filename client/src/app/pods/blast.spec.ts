import POD_RULES from '../../../../shared/rules/pods.json';
import { Blast, blastFrame, hasFaded } from './blast';
import { BlastCell } from './blast-cells';

const STARTED_AT = 10;
const THIRD_OF_BLAST = POD_RULES.blastTicks / 3;
const RIGHT_ARM: BlastCell = { tile: { x: 3, y: 2 }, part: 'arm', direction: 'right' };

describe('blast', () => {
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
