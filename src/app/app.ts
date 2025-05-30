import { Component } from '@angular/core';
import { CountdownComponent } from './countdown/countdown.component';

@Component({
  selector: 'app-root',
  imports: [CountdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'countdown-app-test';
}
