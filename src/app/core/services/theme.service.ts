import { Injectable, signal, effect } from '@angular/core';
import {
  THEME_STORAGE_KEY,
  ThemeMode,
  LIGHT_THEME_COLORS,
  DARK_THEME_COLORS,
  type ThemeColors,
} from '../constants/theme.constants';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeMode = signal<ThemeMode>(this.getInitialTheme());
  public currentTheme = this.themeMode.asReadonly();

  private themeColors = signal<ThemeColors>(
    this.themeMode() === ThemeMode.DARK ? DARK_THEME_COLORS : LIGHT_THEME_COLORS
  );
  public colors = this.themeColors.asReadonly();

  constructor() {
    effect(() => {
      this.applyTheme(this.themeMode());
    });
  }

  private getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return ThemeMode.LIGHT;

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (savedTheme) return savedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? ThemeMode.DARK
      : ThemeMode.LIGHT;
  }

  private applyTheme(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;

    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(`${theme}-theme`);

    this.themeColors.set(
      theme === ThemeMode.DARK ? DARK_THEME_COLORS : LIGHT_THEME_COLORS
    );

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  public toggleTheme(): void {
    const newTheme =
      this.themeMode() === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
    this.themeMode.set(newTheme);
  }

  public isDarkMode(): boolean {
    return this.themeMode() === ThemeMode.DARK;
  }
}
