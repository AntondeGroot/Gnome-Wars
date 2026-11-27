package nl.adg.gnomewars.rules;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LivesRulesTest {

  private final double TICKS_PER_SECOND = 30.0;

  @Test
  void gnomes_are_protected_after_losing_a_life() {
    double secondsProtected = LivesRules.getProtectedTicks() / TICKS_PER_SECOND;
    assertThat(secondsProtected).isBetween(0.5, 3.0);
  }

  @Test
  void number_of_lives_is_small_and_positive() {
    assertThat(LivesRules.getStartingLives()).isBetween(1,5);
  }
}
