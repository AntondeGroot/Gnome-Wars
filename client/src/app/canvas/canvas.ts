import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { SpriteSheet } from '../sprite-atlas';
import { ArenaMap, BACKYARD, PlacedProp, propsIn } from '../arena-map';
import { AnimatedTile, animatedTileFrame, splitAnimated } from '../animated-tiles';
import { Bird, BIRD_BATH } from '../bird';
import { Ladybug } from '../ladybug';
import { FixedTicks } from '../fixed-ticks';
import { Gnome } from '../gnome/gnome';
import { HeldKeys } from '../held-keys';
import { STEERING_KEYS } from '../keyboard-direction';

const TILE = 16;
const FPS_INTERVAL_MS = 1000;
const TICKS_PER_SECOND = 30;

// The keys the game uses, by event.code. Their browser default (scrolling the page) is blocked.
const GAME_KEYS = STEERING_KEYS;

// Temporary, until the enemies (E-steps): the grass tile where a ladybug stands and flaps.
const LADYBUG_TILE = { x: 11, y: 7 };
const GNOME_START_TILE = { x: 5, y: 5 };

const BACKYARD_JSON = 'sprites/atlases/backyard_atlas.json';
const BACKYARD_IMAGE = 'sprites/atlases/backyard_atlas_1x.png';
const GNOME_JSON = 'sprites/atlases/gnome_atlas.json';
const GNOME_IMAGE = 'sprites/atlases/gnome_atlas_1x.png';

/** What every frame draws with, set up once in start(). */
interface ArenaView {
  ctx: CanvasRenderingContext2D;
  backyardSheet: SpriteSheet;
  gnomeSheet: SpriteSheet;

  /** Ground and the props that never change, drawn once; see drawStaticLayer. */
  staticLayer: HTMLCanvasElement;
  /** Props drawn again every frame on top of the static layer, like the glinting pond. */
  animatedTiles: AnimatedTile[];
  birds: Bird[];
  ladybug: Ladybug;
  gnome: Gnome;
}

@Component({
  imports: [],
  selector: 'app-canvas',
  styleUrl: './canvas.css',
  templateUrl: './canvas.html',
  host: {
    '(window:keydown)': 'onKeyDown($event)',
    '(window:keyup)': 'onKeyUp($event)',
    '(window:blur)': 'onBlur()',
  },
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
  // Ticks since the game started; animations pick their frame from it.
  private tickCount = 0;

  private readonly heldKeys = new HeldKeys();

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

    // Both downloads start at once; await waits until both are in.
    const [backyardSheet, gnomeSheet] = await Promise.all([
      SpriteSheet.load(BACKYARD_IMAGE, BACKYARD_JSON),
      SpriteSheet.load(GNOME_IMAGE, GNOME_JSON),
    ]);
    const props = propsIn(BACKYARD);
    const { stillProps, animatedTiles } = splitAnimated(props, backyardSheet.animations);
    const staticLayer = this.drawStaticLayer(
      backyardSheet,
      stillProps,
      ctx.canvas.width,
      ctx.canvas.height,
    );
    if (staticLayer === null) {
      return;
    }
    const birds = props
      .filter((prop) => prop.frame === BIRD_BATH)
      .map((prop) => new Bird(prop.x, prop.y, backyardSheet.animations));
    const ladybug = new Ladybug(LADYBUG_TILE.x, LADYBUG_TILE.y, backyardSheet.animations);
    // The gnome moves 1 unit per tick, so it keeps its position in units, not tiles.
    const gnome = new Gnome(GNOME_START_TILE.x * TILE, GNOME_START_TILE.y * TILE);
    this.requestFrame({
      ctx,
      backyardSheet,
      gnomeSheet,
      staticLayer,
      animatedTiles,
      birds,
      ladybug,
      gnome,
    });
  }

  /**
   * Draws everything that doesn't change (ground and still props) once, onto a canvas that is
   * never shown.
   * Each frame then copies it in a single drawImage instead of drawing every tile again.
   * Returns null when the browser can't give a 2D context, like the main canvas in start().
   */
  private drawStaticLayer(
    sheet: SpriteSheet,
    stillProps: PlacedProp[],
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
    for (const prop of stillProps) {
      sheet.drawFrame(ctx, prop.frame, prop.x * TILE, prop.y * TILE);
    }
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
      this.tick(view);
    }

    view.ctx.drawImage(view.staticLayer, 0, 0);
    this.drawAnimatedTiles(view);
    this.drawBirds(view);
    this.drawLadybug(view);
    this.drawGnome(view);
    this.countFrame(time);
    this.drawFps(view.ctx);
    this.requestFrame(view);
  }

  /** One step of the game, 30 times per second. For now only the birds and the ladybug move. */
  private tick(view: ArenaView): void {
    this.tickCount++;
    for (const bird of view.birds) {
      bird.update(this.tickCount);
    }
    view.ladybug.update(this.tickCount);
  }

  private drawAnimatedTiles({ ctx, backyardSheet, animatedTiles }: ArenaView): void {
    for (const tile of animatedTiles) {
      backyardSheet.drawFrame(
        ctx,
        animatedTileFrame(tile, this.tickCount),
        tile.x * TILE,
        tile.y * TILE,
      );
    }
  }

  private drawLadybug({ ctx, backyardSheet, ladybug }: ArenaView): void {
    const { name, offsetY } = ladybug.frameAt(this.tickCount);
    backyardSheet.drawFrame(ctx, name, ladybug.x * TILE, ladybug.y * TILE + offsetY);
  }

  private drawGnome({ ctx, gnomeSheet, gnome }: ArenaView): void {
    // As the atlas says: the shadow at the gnome's position, the gnome 1 px higher so it stands on it.
    gnomeSheet.drawFrame(ctx, 'shadow', gnome.x, gnome.y);
    gnomeSheet.drawFrame(ctx, gnome.frameName, gnome.x, gnome.y - 1);
  }

  private drawBirds({ ctx, backyardSheet, birds }: ArenaView): void {
    for (const bird of birds) {
      const { name, flipX, offset } = bird.frameAt(this.tickCount);
      const x = bird.x * TILE + offset[0];
      const y = bird.y * TILE + offset[1];
      if (flipX) {
        backyardSheet.drawFrameMirrored(ctx, name, x, y);
      } else {
        backyardSheet.drawFrame(ctx, name, x, y);
      }
    }
  }

  private drawGround(ctx: CanvasRenderingContext2D, sheet: SpriteSheet, map: ArenaMap): void {
    for (const [y, row] of map.grid.entries()) {
      for (const x of [...row].keys()) {
        sheet.drawFrame(ctx, 'grass_0', x * TILE, y * TILE);
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

  // event.code names the physical key ('KeyD'), the same with or without Shift and on any keyboard
  // layout; event.key would give 'd' on press and 'D' on a release with Shift held, so D would stick.
  protected onKeyDown(event: KeyboardEvent): void {
    if (GAME_KEYS.has(event.code)) {
      event.preventDefault();
    }
    this.heldKeys.press(event.code);
  }

  protected onKeyUp(event: KeyboardEvent): void {
    this.heldKeys.release(event.code);
  }

  /** A key released while another window has focus never sends keyup here, so forget them all. */
  protected onBlur(): void {
    this.heldKeys.clear();
  }
}
