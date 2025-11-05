/**
 * Rating Models - matches backend DTOs
 */

/**
 * Rating entity from backend
 */
export interface Rating {
  id: string;
  recipeId: string;
  userId: string;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating/updating a rating
 */
export interface CreateRatingDto {
  recipeId: string;
  userId: string;
  stars: number; // 1-5
}

/**
 * DTO for updating a rating
 */
export interface UpdateRatingDto {
  stars: number; // 1-5
}

/**
 * Rating response from backend
 */
export interface RatingResponseDto {
  id: string;
  recipeId: string;
  userId: string;
  stars: number;
  createdAt: Date;
  updatedAt: Date;
}
