import { Component } from '@angular/core';
import { Assistant } from './assistant';

@Component({
  selector: 'app-assistant-page',
  standalone: true,
  imports: [Assistant],
  template: '<app-assistant class="block h-full w-full"></app-assistant>',
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
  `]
})
export class AssistantPage {}
