import { afterNextRender, Component, ElementRef, viewChild } from '@angular/core';
import { SpriteSheet } from '../sprite-atlas';
import { ArenaMap, BACKYARD } from '../arena-map';
import { autotileFrame, isAutotile } from '../autotile';

const TILE = 16;

@Component({
  imports: [],
  selector: 'app-canvas',
  styleUrl: './canvas.css',
  templateUrl: './canvas.html',
})
export class Canvas {
  // The <canvas #canvas> from the template. Only filled in once the template is on the page.
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    // The constructor runs before the template exists, so wait for the first render to draw.
    afterNextRender(() => this.draw());
  }

  private async draw(): Promise<void> {
    const ctx = this.canvasRef().nativeElement.getContext('2d');
    if (ctx == null) {
      return;
    }
    ctx.imageSmoothingEnabled = false; // keep pixels crisp
    const sheet = await SpriteSheet.load();
    this.drawGround(ctx, sheet, BACKYARD);
    this.drawProps(ctx, sheet, BACKYARD);
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
}
