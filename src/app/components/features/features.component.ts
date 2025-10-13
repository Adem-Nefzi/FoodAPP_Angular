import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTagModule,
    NzAvatarModule,
    NzButtonModule,
    NzIconModule,
  ],
  templateUrl: './features.component.html',
})
export class FeaturesComponent {
  themeService = inject(ThemeService);

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  features = [
    {
      number: '01',
      icon: 'book',
      title: 'Curated Collections',
      description:
        'Handpicked recipes organized by cuisine, season, and occasion for effortless meal planning.',
      color: '#FF6B6B',
    },
    {
      number: '02',
      icon: 'bulb',
      title: 'Step-by-Step Guidance',
      description:
        'Detailed instructions with professional tips to ensure perfect results every time.',
      color: '#4ECDC4',
    },
    {
      number: '03',
      icon: 'heart',
      title: 'Seasonal Ingredients',
      description:
        'Recipes that celebrate fresh, local produce at its peak flavor and nutritional value.',
      color: '#D4A574',
    },
  ];
}
