import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Favorite,
  CreateFavoriteDto,
  FavoriteCheckResponse,
} from '../models/favorite.models';

/**
 * Favorite Service - Handles all favorite/like operations
 */
@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/favorites';

  /**
   * Add a recipe to favorites
   */
  addFavorite(dto: CreateFavoriteDto): Observable<Favorite> {
    return this.http.post<Favorite>(this.apiUrl, dto);
  }

  /**
   * Get all favorites for a user
   */
  getFavoritesByUserId(userId: string): Observable<Favorite[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Favorite[]>(this.apiUrl, { params });
  }

  /**
   * Check if a recipe is favorited by user
   */
  checkIfFavorite(
    userId: string,
    recipeId: string
  ): Observable<FavoriteCheckResponse> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('recipeId', recipeId);
    return this.http.get<FavoriteCheckResponse>(`${this.apiUrl}/check`, {
      params,
    });
  }

  /**
   * Remove a recipe from favorites
   */
  removeFavorite(userId: string, recipeId: string): Observable<void> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('recipeId', recipeId);
    return this.http.delete<void>(this.apiUrl, { params });
  }

  /**
   * Toggle favorite status (add if not favorited, remove if favorited)
   */
  toggleFavorite(
    userId: string,
    recipeId: string
  ): Observable<{ isFavorite: boolean }> {
    return new Observable((observer) => {
      this.checkIfFavorite(userId, recipeId).subscribe({
        next: (response) => {
          if (response.isFavorite) {
            // Remove from favorites
            this.removeFavorite(userId, recipeId).subscribe({
              next: () => {
                observer.next({ isFavorite: false });
                observer.complete();
              },
              error: (err) => observer.error(err),
            });
          } else {
            // Add to favorites
            this.addFavorite({ userId, recipeId }).subscribe({
              next: () => {
                observer.next({ isFavorite: true });
                observer.complete();
              },
              error: (err) => observer.error(err),
            });
          }
        },
        error: (err) => observer.error(err),
      });
    });
  }
}
