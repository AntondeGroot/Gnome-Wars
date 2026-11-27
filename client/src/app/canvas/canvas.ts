import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { animatedTileFrame } from '../animated-tiles';
import { ARENA_SIZE, ArenaView, loadArenaView, TILE } from '../arena-view';
import { cameraPosition, viewSize } from '../camera';
import { FixedTicks } from '../fixed-ticks';
import { FrameRate } from '../frame-rate';
import { PlayerInput } from '../game/input/player-input';
import { drawPods } from '../pods/pod-sprites';

const TICKS_PER_SECOND = 30;
// CSS pixels per game pixel: a tile is 48 CSS pixels, above the 44 minimum for older players.
const SCALE = 3;

@Component({
  imports: [],
  selector: 'app-canvas',
  styleUrl: './canvas.css',
  templateUrl: './canvas.html',
  host: {
    // On window, as the canvas only gets key events while it has focus.
    '(window:keydown)': 'playerInput.keyboard.keyDown($event)',
    '(window:keyup)': 'playerInput.keyboard.keyUp($event)',
    '(window:blur)': 'playerInput.keyboard.forgetHeldKeys()',
    '(window:resize)': 'fitToWindow()',
  },
})
export class Canvas {
  // The <canvas #canvas> from the template. Only filled in once the template is on the page.
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  // The latest booked frame, so the loop can be stopped.
  private frameId = 0;

  private readonly frameRate = new FrameRate();

  private readonly ticks = new FixedTicks(1000 / TICKS_PER_SECOND);
  // Ticks since the game started; animations pick their frame from it.
  private tickCount = 0;

  protected readonly playerInput = inject(PlayerInput);

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
    this.fitToWindow();

    const view = await loadArenaView(ctx);
    if (view === null) {
      return;
    }
    this.requestFrame(view);
  }

  /**
   * Sizes the canvas to the part of the arena that fits the window at SCALE: all of it on a big
   * screen, the part around the player's gnome on a phone (see drawWorld).
   */
  protected fitToWindow(): void {
    const canvas = this.canvasRef().nativeElement;
    // The page's viewport, not innerWidth/innerHeight: a phone browser zooms out to fit a canvas
    // wider than the screen, and innerWidth then reports that zoomed-out width, so the canvas would
    // never shrink back and its sides would be cut off.
    const { clientWidth, clientHeight } = document.documentElement;
    const screen = { width: Math.floor(clientWidth / SCALE), height: Math.floor(clientHeight / SCALE) };
    const { width, height } = viewSize(screen, ARENA_SIZE);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * SCALE}px`;
    canvas.style.height = `${height * SCALE}px`;
    // Setting the size resets the context's settings, so this has to follow every resize.
    const ctx = canvas.getContext('2d');
    if (ctx !== null) {
      ctx.imageSmoothingEnabled = false; // keep pixels crisp
    }
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

    this.drawWorld(view);
    this.frameRate.countFrame(time);
    this.frameRate.draw(view.ctx);
    this.requestFrame(view);
  }

  /** The arena as the camera sees it: moved so the part around the player's gnome is on screen. */
  private drawWorld(view: ArenaView): void {
    const { ctx, player } = view;
    const camera = cameraPosition(
      { x: player.x + TILE / 2, y: player.y + TILE / 2 },
      { width: ctx.canvas.width, height: ctx.canvas.height },
      ARENA_SIZE,
    );
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    ctx.drawImage(view.staticLayer, 0, 0);
    this.drawBreakables(view);
    this.drawAnimatedTiles(view);
    drawPods(ctx, view.backyardSheet, view.pods, this.tickCount);
    this.drawBirds(view);
    this.drawLadybug(view);
    this.drawGnomes(view);
    ctx.restore();
  }

  /** One step of the game, 30 times per second. For now only the birds, the ladybug and the player move. */
  private tick(view: ArenaView): void {
    this.tickCount++;
    for (const bird of view.birds) {
      bird.update(this.tickCount);
    }
    view.ladybug.update(this.tickCount);
    const direction = this.playerInput.direction();
    if (direction === null) {
      view.player.stop();
    } else {
      view.player.move(direction, view.pods.obstaclesFor(view.player));
    }
    view.pods.update(view.player, this.playerInput.podHeld(), this.tickCount);
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

  private drawBreakables({ ctx, backyardSheet, breakables }: ArenaView): void {
    for (const { frame, tile } of breakables.all) {
      backyardSheet.drawFrame(ctx, frame, tile.x * TILE, tile.y * TILE);
    }
  }

  private drawLadybug({ ctx, backyardSheet, ladybug }: ArenaView): void {
    const { name, offsetY } = ladybug.frameAt(this.tickCount);
    backyardSheet.drawFrame(ctx, name, ladybug.x * TILE, ladybug.y * TILE + offsetY);
  }

  private drawGnomes({ ctx, gnomeSprites, gnomes }: ArenaView): void {
    for (const gnome of gnomes) {
      gnomeSprites.draw(ctx, gnome);
    }
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
}
