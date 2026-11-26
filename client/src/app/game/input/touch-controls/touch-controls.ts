import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
  viewChild,
} from '@angular/core';
import { ControlsSettings } from '../controls-settings';
import { PlayerInput } from '../player-input';
import { HoldButton } from './hold-button';
import { Thumbstick } from './thumbstick';

/**
 * The on-screen thumbstick and plant button for phones, over the free strips beside the arena.
 * They write held state into PlayerInput, the same way the keyboard does; the tick samples it.
 */
@Component({
  selector: 'app-touch-controls',
  styleUrl: './touch-controls.css',
  templateUrl: './touch-controls.html',
})
export class TouchControls {
  /** True while a menu or results screen is open: the controls hide and let go. */
  readonly hidden = input(false);

  protected readonly settings = inject(ControlsSettings);
  private readonly playerInput = inject(PlayerInput);

  // Shown on touch screens: a coarse pointer, or once the first touch arrives.
  private readonly touchSeen = signal(hasCoarsePointer());
  protected readonly visible = computed(() => this.touchSeen() && !this.hidden());

  private readonly controls = viewChild.required<ElementRef<HTMLElement>>('controls');
  private readonly stick = viewChild.required<ElementRef<HTMLElement>>('stick');
  private readonly knob = viewChild.required<ElementRef<HTMLElement>>('knob');
  private readonly plant = viewChild.required<ElementRef<HTMLElement>>('plant');
  private thumbstick?: Thumbstick;
  private plantButton?: HoldButton;

  constructor() {
    const zone = inject(NgZone);
    const listeners = new AbortController();
    inject(DestroyRef).onDestroy(() => listeners.abort());
    // Outside Angular, like the render loop: a moving thumb only changes the held direction.
    afterNextRender(() => zone.runOutsideAngular(() => this.listen(listeners.signal)));
    effect(() => {
      if (!this.visible()) {
        this.releaseAll();
      }
    });
  }

  private listen(signal: AbortSignal): void {
    const touch = this.playerInput.touch;
    this.thumbstick = new Thumbstick(
      this.stick().nativeElement,
      this.knob().nativeElement,
      (direction) => (touch.direction = direction),
      signal,
    );
    this.plantButton = new HoldButton(
      this.plant().nativeElement,
      (held) => (touch.podHeld = held),
      signal,
    );
    // No long-press menu on the controls.
    this.controls().nativeElement.addEventListener('contextmenu', (event) => event.preventDefault(), {
      signal,
    });
    window.addEventListener(
      'pointerdown',
      (event) => {
        if (event.pointerType === 'touch') {
          this.touchSeen.set(true);
        }
      },
      { signal },
    );
  }

  private releaseAll(): void {
    this.thumbstick?.release();
    this.plantButton?.release();
    this.playerInput.touch.release();
  }
}

/** Whether the main pointer is a finger. False where matchMedia doesn't exist, as in tests. */
function hasCoarsePointer(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
}
