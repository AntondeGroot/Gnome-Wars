package nl.adg.gnomewars.rules;

import java.util.List;
import java.util.Map;

public record ArenaConfig(
    List<String> grid,
    Map<String, String> legend,
    List<String> walkable,
    List<String> blastsCross,
    Map<String, Integer> speedPercentOn,
    Map<String, Map<String, Integer>> scatter) {
}
