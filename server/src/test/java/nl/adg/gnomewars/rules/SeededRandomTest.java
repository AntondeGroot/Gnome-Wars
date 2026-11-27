package nl.adg.gnomewars.rules;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.stream.IntStream;
import java.util.stream.LongStream;
import org.junit.jupiter.api.Test;

class SeededRandomTest {

  /** All 32 bits of each number, so a change to even the lowest bit shows. */
  private static final double FULL_RANGE = 0x1p32;

  @Test
  void gives_the_same_numbers_for_seed_1_as_the_client() {
    SeededRandom random = new SeededRandom(1);

    long[] numbers = LongStream.generate(() -> (long) (random.next() * FULL_RANGE))
        .limit(4)
        .toArray();

    // Pinned in the client's seeded-random.spec.ts as SEED_1_NUMBERS.
    assertThat(numbers).containsExactly(2693262067L, 11749833L, 2265367787L, 4213581821L);
  }

  @Test
  void scales_to_the_bound_rounding_down_like_the_client() {
    SeededRandom random = new SeededRandom(1);

    int[] rolls = IntStream.generate(() -> random.nextInt(100)).limit(4).toArray();

    // The pinned numbers above as a share of 2^32, times 100, rounded down.
    assertThat(rolls).containsExactly(62, 0, 52, 98);
  }

  @Test
  void gives_other_numbers_for_another_seed() {
    SeededRandom seed1 = new SeededRandom(1);
    SeededRandom seed2 = new SeededRandom(2);

    assertThat(seed2.next()).isNotEqualTo(seed1.next());
  }
}
