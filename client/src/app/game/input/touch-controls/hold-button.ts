const RELEASE_EVENTS = ['pointerup', 'pointercancel', 'lostpointercapture'] as const;

/**
 * A button that is held while one finger (its own pointerId) presses it, so it works alongside a
 * thumb on the stick. Marks itself with the "held" class for the pressed look.
 */
export class HoldButton {
  private pointerId: number | null = null;

  constructor(
    private readonly button: HTMLElement,
    private readonly onHold: (held: boolean) => void,
    signal: AbortSignal,
  ) {
    button.addEventListener('pointerdown', (event) => this.press(event), { signal });
    for (const type of RELEASE_EVENTS) {
      button.addEventListener(type, (event) => this.letGo(event.pointerId), { signal });
    }
  }

  /** Lets go of the button from outside, as when the controls are hidden. */
  release(): void {
    if (this.pointerId !== null && this.button.hasPointerCapture(this.pointerId)) {
      this.button.releasePointerCapture(this.pointerId);
    }
    this.letGo(this.pointerId);
  }

  private press(event: PointerEvent): void {
    if (this.pointerId !== null) {
      return;
    }
    event.preventDefault();
    this.pointerId = event.pointerId;
    this.button.setPointerCapture(event.pointerId);
    this.button.classList.add('held');
    this.onHold(true);
  }

  private letGo(pointerId: number | null): void {
    if (pointerId === null || pointerId !== this.pointerId) {
      return;
    }
    this.pointerId = null;
    this.button.classList.remove('held');
    this.onHold(false);
  }
}
