import { Component } from '@angular/core';
import { Canvas } from './canvas/canvas';

@Component({
  imports: [Canvas],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
