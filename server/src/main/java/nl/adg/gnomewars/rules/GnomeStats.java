package nl.adg.gnomewars.rules;

import java.io.IOException;
import java.io.UncheckedIOException;

public class GnomeStats {

  private static final int SPEED_STEP = 10;
  private static final GnomeStatsConfig LIMITS;

  static {
    try {
      LIMITS = SharedJson.read(GnomeStatsConfig.class, "rules/gnome-stats.json");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private int podLimit;
  private int blastRange;
  private int unitsPerSecond;

  public GnomeStats() {
    podLimit = LIMITS.podLimit().min();
    blastRange = LIMITS.blastRange().min();
    unitsPerSecond = LIMITS.unitsPerSecond().min();
  }

  public int getPodLimit() {
    return this.podLimit;
  }

  public int getBlastRange() {
    return this.blastRange;
  }

  public int getUnitsPerSecond() {
    return this.unitsPerSecond;
  }

  public void addPod() {
    this.podLimit = Math.min(this.podLimit + 1, LIMITS.podLimit().max());
  }

  public void addSpeed() {
    this.unitsPerSecond = Math.min(this.unitsPerSecond + SPEED_STEP,
        LIMITS.unitsPerSecond().max());
  }

  public void addBlastRange() {
    this.blastRange = Math.min(this.blastRange + 1, LIMITS.blastRange().max());
  }
}