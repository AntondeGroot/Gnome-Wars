package nl.adg.gnomewars.rules;

import java.io.IOException;
import java.io.UncheckedIOException;

public class LivesRules {

  private static final LivesConfig CONFIG;

  static {
    try {
      CONFIG = SharedJson.read(LivesConfig.class, "rules/lives.json");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static int getStartingLives(){
    return CONFIG.startingLives();
  }

  public static int getProtectedTicks(){
    return CONFIG.protectedTicks();
  }
}
