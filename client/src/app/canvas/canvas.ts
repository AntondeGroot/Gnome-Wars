import { afterNextRender, Component, ElementRef, viewChild } from '@angular/core';

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
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx == null) {
      return;
    }

    ctx.imageSmoothingEnabled = false; // keep pixels crisp once we draw images (step B2)
    ctx.fillStyle = '#5a9e3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // the whole 272 × 208 drawing surface
    await this.drawGrass(ctx);
  }

  private async drawGrass(ctx: CanvasRenderingContext2D): Promise<void> {
    const img = new Image();
    img.src = 'sprites/arena/ground/grass_0.png';
    await img.decode();
    ctx.drawImage(img, 0, 0);
  }
}
