/**
 * Favorite Models - Frontend
 */

export interface Favorite {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: Date;
}

export interface CreateFavoriteDto {
  userId: string;
  recipeId: string;
}

export interface FavoriteCheckResponse {
  isFavorite: boolean;
}
