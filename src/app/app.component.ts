import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Inject theme service to ensure it initializes on app start
  private themeService = inject(ThemeService);

  constructor() {
    // Theme service constructor will apply saved theme immediately
  }
}
