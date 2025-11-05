/**
 * Recipe Models - Matching NestJS Backend Schema
 */

export type RecipeStatus = 'pending' | 'approved' | 'rejected';
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeCategory =
  | 'main-course'
  | 'dessert'
  | 'appetizer'
  | 'soup'
  | 'salad';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  category: RecipeCategory;
  prepTime: number;
  cookTime: number;
  difficulty: RecipeDifficulty;
  userId: string;
  averageRating: number;
  totalRatings?: number; // Total number of ratings
  totalFavorites?: number; // Total number of favorites
  status: RecipeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  category: RecipeCategory;
  prepTime: number;
  cookTime: number;
  difficulty: RecipeDifficulty;
  userId: string;
}

export interface UpdateRecipeRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  ingredients?: string[];
  steps?: string[];
  category?: RecipeCategory;
  prepTime?: number;
  cookTime?: number;
  difficulty?: RecipeDifficulty;
}

export interface RecipeQueryParams {
  status?: RecipeStatus;
  category?: RecipeCategory;
  userId?: string;
}
