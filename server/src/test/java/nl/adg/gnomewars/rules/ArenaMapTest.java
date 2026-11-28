package nl.adg.gnomewars.rules;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

public class ArenaMapTest {

  @Test
  void an_arena_is_read_from_json(){
    assertThat(ArenaMap.getGrid()).isNotNull();
  }

  @Test
  void an_arena_is_at_least_10x10() {
    int nrRows = ArenaMap.getGrid().size();
    int nrColumns = ArenaMap.getGrid().getFirst().length();

    assertThat(nrRows).isGreaterThan(10);
    assertThat(nrColumns).isGreaterThan(10);
  }
}
