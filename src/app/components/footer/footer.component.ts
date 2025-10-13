import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, NzIconModule, NzButtonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  themeService = inject(ThemeService);
  currentYear = new Date().getFullYear();

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
