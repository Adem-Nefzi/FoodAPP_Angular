import { Component, Input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Recipe } from '../../../core/models/recipe.models';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService } from '../../../core/services/user-profile.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent implements OnInit {
  private router = inject(Router);
  private favoriteService = inject(FavoriteService);
  private authService = inject(AuthService);
  private profileService = inject(UserProfileService);
  private message = inject(NzMessageService);

  @Input() recipe!: Recipe;
  isFavorited = signal(false);
  isFavoriteLoading = signal(false);

  ngOnInit() {
    this.checkFavoriteStatus();
  }

  checkFavoriteStatus() {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !this.recipe) return;

    this.favoriteService
      .checkIfFavorite(currentUser.id, this.recipe.id)
      .subscribe({
        next: (response) => {
          this.isFavorited.set(response.isFavorite);
        },
        error: (error) => {
          console.error('Error checking favorite status:', error);
        },
      });
  }

  onViewRecipe() {
    this.router.navigate(['/recipe', this.recipe.id]);
  }

  toggleFavorite(event?: Event) {
    // Prevent card click event from firing
    if (event) {
      event.stopPropagation();
    }

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.message.warning('Please login to save favorites');
      return;
    }

    if (!this.recipe) return;

    this.isFavoriteLoading.set(true);
    this.favoriteService
      .toggleFavorite(currentUser.id, this.recipe.id)
      .subscribe({
        next: (response) => {
          this.isFavorited.set(response.isFavorite);
          this.isFavoriteLoading.set(false);

          if (response.isFavorite) {
            this.profileService.incrementFavoriteCount();
            this.message.success('Added to favorites! ❤️');
          } else {
            this.profileService.decrementFavoriteCount();
            this.message.info('Removed from favorites');
          }
        },
        error: (error) => {
          console.error('Error toggling favorite:', error);
          this.message.error('Failed to update favorite status');
          this.isFavoriteLoading.set(false);
        },
      });
  }
}
