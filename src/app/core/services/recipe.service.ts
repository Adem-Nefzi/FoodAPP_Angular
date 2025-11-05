import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Recipe,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeQueryParams,
} from '../models/recipe.models';

/**
 * Recipe Service
 * Handles all recipe-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.nestApiUrl}/recipes`; // NestJS microservice

  /**
   * Get all recipes with optional filters
   */
  getAllRecipes(params?: RecipeQueryParams): Observable<Recipe[]> {
    let httpParams = new HttpParams();

    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params?.userId) {
      httpParams = httpParams.set('userId', params.userId);
    }

    return this.http.get<Recipe[]>(this.API_URL, { params: httpParams });
  }

  /**
   * Get recipes by status
   * TODO: Uncomment when status filtering is implemented on backend
   */
  // getRecipesByStatus(
  //   status: 'pending' | 'approved' | 'rejected'
  // ): Observable<Recipe[]> {
  //   return this.getAllRecipes({ status });
  // }

  /**
   * Get recipes by category
   */
  getRecipesByCategory(category: string): Observable<Recipe[]> {
    return this.getAllRecipes({ category: category as any });
  }

  /**
   * Get recipes by user ID
   */
  getRecipesByUserId(userId: string): Observable<Recipe[]> {
    return this.getAllRecipes({ userId });
  }

  /**
   * Get a single recipe by ID
   */
  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.API_URL}/${id}`);
  }

  /**
   * Create a new recipe
   */
  createRecipe(recipe: CreateRecipeRequest): Observable<Recipe> {
    return this.http.post<Recipe>(this.API_URL, recipe);
  }

  /**
   * Update an existing recipe
   */
  updateRecipe(id: string, recipe: UpdateRecipeRequest): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.API_URL}/${id}`, recipe);
  }

  /**
   * Approve a recipe (Admin only)
   * TODO: Uncomment when approval system is implemented on backend
   */
  // approveRecipe(id: string): Observable<Recipe> {
  //   return this.http.put<Recipe>(`${this.API_URL}/${id}/approve`, {});
  // }

  /**
   * Reject a recipe (Admin only)
   * TODO: Uncomment when approval system is implemented on backend
   */
  // rejectRecipe(id: string): Observable<Recipe> {
  //   return this.http.put<Recipe>(`${this.API_URL}/${id}/reject`, {});
  // }

  /**
   * Delete a recipe
   */
  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
