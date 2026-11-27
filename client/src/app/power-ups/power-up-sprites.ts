import { SpriteSheet } from '../sprite-atlas';
import { TILE_UNITS } from '../game/rules/walls';
import { PowerUpKind, PowerUps } from '../game/rules/power-ups';

/** The backyard atlas frame for each kind. */
const FRAMES: Record<PowerUpKind, string> = {
  range: 'pu_range',
  pod: 'pu_bomb',
  speed: 'pu_speed',
};

/** Draws the power-ups lying on the lawn, on the ground under everything that walks. */
export function drawPowerUps(
  ctx: CanvasRenderingContext2D,
  backyardSheet: SpriteSheet,
  powerUps: PowerUps,
): void {
  for (const { tile, kind } of powerUps.all) {
    backyardSheet.drawFrame(ctx, FRAMES[kind], tile.x * TILE_UNITS, tile.y * TILE_UNITS);
  }
}
