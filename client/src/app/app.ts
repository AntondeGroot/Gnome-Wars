import { Component } from '@angular/core';
import { Canvas } from './canvas/canvas';
import { TouchControls } from './game/input/touch-controls/touch-controls';

@Component({
  imports: [Canvas, TouchControls],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
