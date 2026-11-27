package nl.adg.gnomewars.rules;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

public class GnomeStatsTest {
  @Test
  void starts_every_stat_at_its_minimum_from_the_shared_rules() {
    GnomeStats stats = new GnomeStats();

    assertThat(stats.getPodLimit()).isEqualTo(1);
    assertThat(stats.getBlastRange()).isEqualTo(1);
    assertThat(stats.getUnitsPerSecond()).isEqualTo(30);
  }
}
