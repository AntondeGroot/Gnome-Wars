package nl.adg.gnomewars.rules;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;

public final class ArenaMap {

  private static final ArenaConfig CONFIG;

  static {
    try {
      CONFIG = SharedJson.read(ArenaConfig.class, "maps/backyard.json");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private ArenaMap() {}

  public static List<String> getGrid(){
    return CONFIG.grid();
  }

}
