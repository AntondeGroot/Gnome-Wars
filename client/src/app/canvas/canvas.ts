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
import { FixedTicks } from '../fixed-ticks';

const TILE = 16;
const FPS_INTERVAL_MS = 1000;
const TICKS_PER_SECOND = 30;

// Temporary, until the first gnome (D1): a sprite that walks along one grass row, 1 unit per tick,
// to show the game runs at the same speed on every screen.
const TEST_SPRITE_FRAME = 'player1_idle';
const TEST_SPRITE_ROW = 5;

/** What every frame draws with, set up once in start(). */
interface ArenaView {
  ctx: CanvasRenderingContext2D;
  sheet: SpriteSheet;
  /** Ground and props, drawn once; see drawStaticLayer. */
  staticLayer: HTMLCanvasElement;
}

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

  private readonly ticks = new FixedTicks(1000 / TICKS_PER_SECOND);
  // The game state: for now only the test sprite's position, in units (1 unit = 1 game pixel).
  private testSpriteX = 0;

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
    const staticLayer = this.drawStaticLayer(sheet, ctx.canvas.width, ctx.canvas.height);
    if (staticLayer === null) {
      return;
    }
    this.requestFrame({ ctx, sheet, staticLayer });
  }

  /**
   * Draws everything that doesn't move (ground and props) once, onto a canvas that is never shown.
   * Each frame then copies it in a single drawImage instead of drawing every tile again.
   * Returns null when the browser can't give a 2D context, like the main canvas in start().
   */
  private drawStaticLayer(
    sheet: SpriteSheet,
    width: number,
    height: number,
  ): HTMLCanvasElement | null {
    const staticLayer = document.createElement('canvas');
    staticLayer.width = width;
    staticLayer.height = height;
    const ctx = staticLayer.getContext('2d');
    if (ctx == null) {
      return null;
    }
    ctx.imageSmoothingEnabled = false;

    this.drawGround(ctx, sheet, BACKYARD);
    this.drawProps(ctx, sheet, BACKYARD);
    return staticLayer;
  }

  /**
   * Asks the browser to call drawFrame just before the next screen refresh. The arrow function
   * keeps `this` and passes the view along; requestAnimationFrame itself only passes the time.
   */
  private requestFrame(view: ArenaView): void {
    this.frameId = requestAnimationFrame((time) => this.drawFrame(view, time));
  }

  /**
   * Runs once per screen refresh (60, 144, … times per second): first advances the game by the
   * ticks that are due, then draws its latest state and books the next frame.
   */
  private drawFrame(view: ArenaView, time: number): void {
    const ticksDue = this.ticks.ticksDue(time);
    for (let i = 0; i < ticksDue; i++) {
      this.tick(view.ctx.canvas.width);
    }

    view.ctx.drawImage(view.staticLayer, 0, 0);
    view.sheet.drawFrame(view.ctx, TEST_SPRITE_FRAME, this.testSpriteX, TEST_SPRITE_ROW * TILE);
    this.countFrame(time);
    this.drawFps(view.ctx);
    this.requestFrame(view);
  }

  /** One step of the game, 30 times per second. For now: the test sprite walks right and wraps around. */
  private tick(arenaWidth: number): void {
    this.testSpriteX = (this.testSpriteX + 1) % arenaWidth;
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
