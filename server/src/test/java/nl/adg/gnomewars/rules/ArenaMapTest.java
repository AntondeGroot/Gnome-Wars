package nl.adg.gnomewars.rules;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

public class ArenaMapTest {

  private static final int BACKYARD_WIDTH = 17;
  private static final int BACKYARD_HEIGHT = 13;
  private static final List<Character> START_LETTERS = List.of('1', '2', '3', '4');

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

  @Test
  void loads_the_backyard_as_17_by_13_tiles() {
    List<String> grid = ArenaMap.getGrid();

    // Counted in code points, as the client's [...row] does, so '░' and '≈' count as one tile.
    assertThat(grid).hasSize(BACKYARD_HEIGHT);
    assertThat(grid).allSatisfy(row -> assertThat(row.codePointCount(0, row.length()))
        .isEqualTo(BACKYARD_WIDTH));
  }

  @Test
  void has_start_tiles_1_to_4_once_each() {
    String letters = String.join("", ArenaMap.getGrid());

    assertThat(START_LETTERS).allSatisfy(start ->
        assertThat(letters.chars().filter(letter -> letter == start).count())
            .as("start tile %c", start)
            .isEqualTo(1));
  }
}
