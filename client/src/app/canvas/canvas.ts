import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { animatedTileFrame } from '../animated-tiles';
import { ArenaView, loadArenaView, TILE } from '../arena-view';
import { FixedTicks } from '../fixed-ticks';
import { FrameRate } from '../frame-rate';
import { Keyboard } from '../keyboard';

const TICKS_PER_SECOND = 30;

@Component({
  imports: [],
  selector: 'app-canvas',
  styleUrl: './canvas.css',
  templateUrl: './canvas.html',
  host: {
    // On window, as the canvas only gets key events while it has focus.
    '(window:keydown)': 'keyboard.keyDown($event)',
    '(window:keyup)': 'keyboard.keyUp($event)',
    '(window:blur)': 'keyboard.forgetHeldKeys()',
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

  protected readonly keyboard = new Keyboard();

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

    const view = await loadArenaView(ctx);
    if (view === null) {
      return;
    }
    this.requestFrame(view);
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
    this.drawGnomes(view);
    this.frameRate.countFrame(time);
    this.frameRate.draw(view.ctx);
    this.requestFrame(view);
  }

  /** One step of the game, 30 times per second. For now only the birds, the ladybug and the player move. */
  private tick(view: ArenaView): void {
    this.tickCount++;
    for (const bird of view.birds) {
      bird.update(this.tickCount);
    }
    view.ladybug.update(this.tickCount);
    const direction = this.keyboard.direction();
    if (direction === null) {
      view.player.stop();
    } else {
      view.player.move(direction);
    }
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
