package nl.adg.gnomewars.rules;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;

/** Reads the JSON in shared/ that the client reads too: the maps and the rule numbers. */
public class SharedJson {

  private static final ObjectMapper mapper = new ObjectMapper();

  /**
   * Reads `path` under shared/, such as "rules/gnome-stats.json", as a `type`. Maven copies those
   * files onto the classpath (see the resources in pom.xml), so this works from any working
   * directory and inside the war.
   */
  public static <T> T read(Class<T> type, String path) throws IOException {
    try (InputStream json = SharedJson.class.getResourceAsStream("/shared/" + path)) {
      if (json == null) {
        throw new IOException("Missing shared/" + path + " on the classpath");
      }
      return mapper.readValue(json, type);
    }
  }
}
