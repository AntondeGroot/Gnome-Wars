import { Direction } from '../direction';

export class Gnome {
  private facing: Direction = 'down';
  private skin = 'red';
  private state = 'idle';

  constructor(
    private _x: number,
    private _y: number,
  ) {}

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  move(direction: Direction): void {
    this.facing = direction;
    switch (direction) {
      case "up":
        this._y--;
        break;
      case "down":
        this._y++;
        break;
      case "left":
        this._x--;
        break;
      case "right":
        this._x++;
        break;
    }
  }

  get frameName(): string {
    return `${this.skin}/${this.facing}_${this.state}`;
  }
}
