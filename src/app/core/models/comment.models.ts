/**
 * Comment Models
 * Interfaces for comment entities and DTOs
 */

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  text: string;
  parentCommentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[]; // For nested replies in tree structure
}

export interface CreateCommentDto {
  recipeId: string;
  userId: string;
  text: string;
  parentCommentId?: string | null;
}

export interface UpdateCommentDto {
  text: string;
}

export interface CommentResponseDto {
  id: string;
  recipeId: string;
  userId: string;
  text: string;
  parentCommentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  replies?: CommentResponseDto[];
}
