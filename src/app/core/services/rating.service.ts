import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateRatingDto,
  UpdateRatingDto,
  RatingResponseDto,
} from '../models/rating.models';

/**
 * Rating Service
 * Handles all rating-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.nestApiUrl}/ratings`;

  /**
   * Create or update a rating for a recipe
   * If user already rated, it updates; otherwise creates new
   */
  createOrUpdateRating(dto: CreateRatingDto): Observable<RatingResponseDto> {
    return this.http.post<RatingResponseDto>(this.API_URL, dto);
  }

  /**
   * Get all ratings for a specific recipe
   */
  getRatingsByRecipeId(recipeId: string): Observable<RatingResponseDto[]> {
    const params = new HttpParams().set('recipeId', recipeId);
    return this.http.get<RatingResponseDto[]>(this.API_URL, { params });
  }

  /**
   * Get all ratings by a specific user
   */
  getRatingsByUserId(userId: string): Observable<RatingResponseDto[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<RatingResponseDto[]>(this.API_URL, { params });
  }

  /**
   * Get a specific user's rating for a recipe
   * Returns null if user hasn't rated this recipe
   */
  getUserRatingForRecipe(
    userId: string,
    recipeId: string
  ): Observable<RatingResponseDto | null> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('recipeId', recipeId);
    return this.http.get<RatingResponseDto | null>(
      `${this.API_URL}/user-rating`,
      { params }
    );
  }

  /**
   * Update an existing rating
   */
  updateRating(
    ratingId: string,
    userId: string,
    dto: UpdateRatingDto
  ): Observable<RatingResponseDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.put<RatingResponseDto>(
      `${this.API_URL}/${ratingId}`,
      dto,
      {
        params,
      }
    );
  }

  /**
   * Delete a rating
   */
  deleteRating(ratingId: string, userId: string): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete<void>(`${this.API_URL}/${ratingId}`, { params });
  }
}
