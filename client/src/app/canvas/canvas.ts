import { afterNextRender, Component, ElementRef, viewChild } from '@angular/core';
import { SpriteSheet } from '../sprite-atlas';
import { ArenaMap, BACKYARD } from '../arena-map';

const TILE = 16;
const COLUMNS = 17; // 272 / 16
const ROWS = 13; // 208 / 16

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
    this.drawMap(ctx, sheet, BACKYARD);
  }

  private drawMap(ctx: CanvasRenderingContext2D, sheet: SpriteSheet, map: ArenaMap){
    for (const [y, row] of map.grid.entries()) {
      for (const [x, letter] of [...row].entries()) {
        // 1. look the letter up in map.legend → frame name
        const frameName = map.legend[letter];
        if(frameName == undefined){
          throw new Error(`Undefined character found in backyard.json grid: ${letter}`)
        }
        sheet.drawFrame(ctx, frameName, x*TILE, y*TILE);
      }
    }
  }

  private drawLawn(ctx: CanvasRenderingContext2D, sheet: SpriteSheet): void {
    for (let x = 0; x < COLUMNS; x++) {
      for (let y = 0; y < ROWS; y++) {
        sheet.drawFrame(ctx, 'grass_0', x * TILE, y * TILE);
      }
    }
  }
}
