import { Direction } from '../../../direction';
import { pickDirection } from '../pick-direction';

/** How far the knob sits from the centre, in CSS pixels, when the stick points somewhere. */
const KNOB_TRAVEL_PX = 40;
const KNOB_OFFSET: Record<Direction, [x: number, y: number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const RELEASE_EVENTS = ['pointerup', 'pointercancel', 'lostpointercapture'] as const;

/**
 * A fixed thumbstick: one finger (its own pointerId) steers it, and the knob snaps to the picked
 * direction rather than following the finger. Updates the DOM directly, never through Angular,
 * so moving a thumb doesn't re-render anything.
 */
export class Thumbstick {
  private pointerId: number | null = null;
  private direction: Direction | null = null;

  constructor(
    private readonly stick: HTMLElement,
    private readonly knob: HTMLElement,
    private readonly onSteer: (direction: Direction | null) => void,
    signal: AbortSignal,
  ) {
    stick.addEventListener('pointerdown', (event) => this.grab(event), { signal });
    stick.addEventListener('pointermove', (event) => this.follow(event), { signal });
    for (const type of RELEASE_EVENTS) {
      stick.addEventListener(type, (event) => this.letGo(event.pointerId), { signal });
    }
  }

  /** Lets go of the stick from outside, as when the controls are hidden. */
  release(): void {
    if (this.pointerId !== null && this.stick.hasPointerCapture(this.pointerId)) {
      this.stick.releasePointerCapture(this.pointerId);
    }
    this.letGo(this.pointerId);
  }

  private grab(event: PointerEvent): void {
    if (this.pointerId !== null) {
      return; // Already held by another finger.
    }
    event.preventDefault();
    this.pointerId = event.pointerId;
    // Keeps the events coming here when the thumb slides off the stick.
    this.stick.setPointerCapture(event.pointerId);
    this.follow(event);
  }

  private follow(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    const bounds = this.stick.getBoundingClientRect();
    const radius = bounds.width / 2;
    const dx = (event.clientX - (bounds.left + radius)) / radius;
    const dy = (event.clientY - (bounds.top + radius)) / radius;
    this.show(pickDirection(dx, dy, this.direction));
  }

  private letGo(pointerId: number | null): void {
    if (pointerId !== this.pointerId) {
      return;
    }
    this.pointerId = null;
    this.show(null);
  }

  private show(direction: Direction | null): void {
    if (direction === this.direction) {
      return;
    }
    this.direction = direction;
    this.onSteer(direction);
    const [x, y] = direction === null ? [0, 0] : KNOB_OFFSET[direction];
    this.knob.style.transform = `translate(${x * KNOB_TRAVEL_PX}px, ${y * KNOB_TRAVEL_PX}px)`;
    // Lights up that direction's quarter of the ring and its arrow; see the CSS.
    this.stick.dataset['direction'] = direction ?? '';
  }
}
