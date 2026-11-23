import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { SpriteSheet } from '../sprite-atlas';
import { ArenaMap, BACKYARD } from '../arena-map';
import { autotileFrame, isAutotile } from '../autotile';

const TILE = 16;
const FPS_INTERVAL_MS = 1000;

@Component({
  imports: [],
  selector: 'app-canvas',
  styleUrl: './canvas.css',
  templateUrl: './canvas.html',
})
export class Canvas {
  // The <canvas #canvas> from the template. Only filled in once the template is on the page.
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  // The latest booked frame, so the loop can be stopped.
  private frameId = 0;

  // Frame-rate counter: frames counted since the last update, shown once per second.
  private framesCounted = 0;
  private lastFpsUpdate = 0;
  private fps = 0;

  constructor() {
    // The constructor runs before the template exists, so wait for the first render to start.
    afterNextRender(() => this.start());
    // Without this the loop keeps running after the component is gone.
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frameId));
  }

  /** Runs once: everything that only has to happen before the first frame. */
  private async start(): Promise<void> {
    const ctx = this.canvasRef().nativeElement.getContext('2d');
    if (ctx == null) {
      return;
    }
    ctx.imageSmoothingEnabled = false; // keep pixels crisp

    const sheet = await SpriteSheet.load();
    this.requestFrame(ctx, sheet);
  }

  /**
   * Asks the browser to call drawFrame just before the next screen refresh. The arrow function
   * keeps `this` and passes ctx and sheet along; requestAnimationFrame itself only passes the time.
   */
  private requestFrame(ctx: CanvasRenderingContext2D, sheet: SpriteSheet): void {
    this.frameId = requestAnimationFrame((time) => this.drawFrame(ctx, sheet, time));
  }

  /** Runs about 60 times per second: redraws the whole picture, then books the next frame. */
  private drawFrame(ctx: CanvasRenderingContext2D, sheet: SpriteSheet, time: number): void {
    this.drawGround(ctx, sheet, BACKYARD);
    this.drawProps(ctx, sheet, BACKYARD);
    this.countFrame(time);
    this.drawFps(ctx);
    this.requestFrame(ctx, sheet);
  }

  private drawGround(ctx: CanvasRenderingContext2D, sheet: SpriteSheet, map: ArenaMap): void {
    for (const [y, row] of map.grid.entries()) {
      for (const x of [...row].keys()) {
        sheet.drawFrame(ctx, 'grass_0', x * TILE, y * TILE);
      }
    }
  }

  // The map's rows and letters are checked by arena-map.spec.ts, so drawing can trust them.
  private drawProps(ctx: CanvasRenderingContext2D, sheet: SpriteSheet, map: ArenaMap): void {
    for (const [y, row] of map.grid.entries()) {
      for (const [x, letter] of [...row].entries()) {
        const name = map.legend[letter];
        if (name === null) continue;

        const frameName = isAutotile(name) ? autotileFrame(name, map.grid, x, y) : name;
        sheet.drawFrame(ctx, frameName, x * TILE, y * TILE);
      }
    }
  }

  /** Counts this frame; once a second the count becomes the shown frame rate. */
  private countFrame(time: number): void {
    this.framesCounted++;
    if (time - this.lastFpsUpdate >= FPS_INTERVAL_MS) {
      this.fps = this.framesCounted;
      this.framesCounted = 0;
      this.lastFpsUpdate = time;
    }
  }

  /** The frame rate in the top-left corner, white on a dark box so it reads on any tile. */
  private drawFps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(2, 2, 34, 10);
    ctx.fillStyle = 'white';
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.fps} fps`, 4, 3);
  }
}
