const FPS_INTERVAL_MS = 1000;

/** The frames shown per second, counted over each second and drawn in the top-left corner. */
export class FrameRate {
  // Frames counted since the last update, shown once per second.
  private framesCounted = 0;
  private lastFpsUpdate = 0;
  private fps = 0;

  /** Counts this frame; once a second the count becomes the shown frame rate. */
  countFrame(time: number): void {
    this.framesCounted++;
    if (time - this.lastFpsUpdate >= FPS_INTERVAL_MS) {
      this.fps = this.framesCounted;
      this.framesCounted = 0;
      this.lastFpsUpdate = time;
    }
  }

  /** The frame rate in the top-left corner, white on a dark box so it reads on any tile. */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(2, 2, 34, 10);
    ctx.fillStyle = 'white';
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.fps} fps`, 4, 3);
  }
}
