import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FavoriteService } from '../../core/services/favorite.service';
import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Favorite } from '../../core/models/favorite.models';
import { Recipe } from '../../core/models/recipe.models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  private recipeService = inject(RecipeService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  favorites = signal<Favorite[]>([]);
  favoriteRecipes = signal<Recipe[]>([]);
  isLoading = signal(true);
  isDarkMode = computed(() => this.themeService.isDarkMode());
  currentUser = computed(() => this.authService.currentUser());

  ngOnInit(): void {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);
    this.favoriteService.getFavoritesByUserId(user.id).subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.loadFavoriteRecipes(favorites);
      },
      error: (err) => {
        console.error('Failed to load favorites:', err);
        this.message.error('Failed to load favorites');
        this.isLoading.set(false);
      },
    });
  }

  private loadFavoriteRecipes(favorites: Favorite[]): void {
    if (favorites.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const recipePromises = favorites.map((fav) =>
      this.recipeService.getRecipeById(fav.recipeId).toPromise()
    );

    Promise.all(recipePromises)
      .then((recipes) => {
        this.favoriteRecipes.set(
          recipes.filter((r): r is Recipe => r !== undefined)
        );
        this.isLoading.set(false);
      })
      .catch((err) => {
        console.error('Failed to load favorite recipes:', err);
        this.message.error('Failed to load recipes');
        this.isLoading.set(false);
      });
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/recipe', recipeId]);
  }

  removeFavorite(recipeId: string): void {
    const user = this.currentUser();
    if (!user) return;

    this.favoriteService.removeFavorite(user.id, recipeId).subscribe({
      next: () => {
        this.favorites.update((favs) =>
          favs.filter((f) => f.recipeId !== recipeId)
        );
        this.favoriteRecipes.update((recipes) =>
          recipes.filter((r) => r.id !== recipeId)
        );
        this.message.success('Recipe removed from favorites');
      },
      error: (err) => {
        console.error('Failed to remove favorite:', err);
        this.message.error('Failed to remove favorite');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
