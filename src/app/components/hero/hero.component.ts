import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzBadgeModule,
    NzAvatarModule,
  ],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {
  themeService = inject(ThemeService);

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  stats = [
    { value: '500+', label: 'Recipes', color: 'var(--color-primary)' },
    { value: '50K+', label: 'Chefs', color: 'var(--color-secondary)' },
    { value: '4.9★', label: 'Rating', color: 'var(--color-accent)' },
  ];
}
