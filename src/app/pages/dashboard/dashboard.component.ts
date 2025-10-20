import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RecipesListComponent } from './recipe-list/recipe-list.component';
import { AiChatComponent } from './ai-tab/ai-tab.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzDrawerModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    SidebarComponent,
    RecipesListComponent,
    AiChatComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  // Inject ThemeService - it handles theme globally
  themeService = inject(ThemeService);

  // Component state
  activeTab = signal<'recipes' | 'ai'>('recipes');
  sidebarCollapsed = signal(false);
  sidebarVisible = signal(false);

  // ✅ FIXED: Use computed signal instead of getter for better performance
  isDarkMode = this.themeService.isDarkMode;

  switchTab(tab: 'recipes' | 'ai') {
    this.activeTab.set(tab);
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }

  openSidebar() {
    this.sidebarVisible.set(true);
  }

  closeSidebar() {
    this.sidebarVisible.set(false);
  }
}
