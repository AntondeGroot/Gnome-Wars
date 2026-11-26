import { Injectable, signal } from '@angular/core';

/** Which thumb steers: 'right' puts the stick bottom-right, 'left' mirrors the controls. */
export type Handedness = 'right' | 'left';

const HANDEDNESS_KEY = 'gnomewars.controls.handedness';

/** The player's control settings, remembered in this browser. A settings screen comes later. */
@Injectable({ providedIn: 'root' })
export class ControlsSettings {
  readonly handedness = signal<Handedness>(readHandedness());

  setHandedness(handedness: Handedness): void {
    this.handedness.set(handedness);
    try {
      localStorage.setItem(HANDEDNESS_KEY, handedness);
    } catch {
      // Storage can be blocked (private window, cleared site data); the setting then lasts this visit.
    }
  }
}

function readHandedness(): Handedness {
  try {
    return localStorage.getItem(HANDEDNESS_KEY) === 'left' ? 'left' : 'right';
  } catch {
    return 'right';
  }
}
