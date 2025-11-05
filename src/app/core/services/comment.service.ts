import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
} from '../models/comment.models';
import { environment } from '../../../environments/environment';

/**
 * Comment Service
 * Handles all comment-related API calls to NestJS backend
 */
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly apiUrl = `${environment.nestApiUrl}/comments`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new comment or reply
   */
  createComment(dto: any): Observable<CommentResponseDto> {
    console.log('Service sending:', dto);
    console.log('API URL:', this.apiUrl);
    return this.http.post<CommentResponseDto>(this.apiUrl, dto);
  }

  /**
   * Get all comments for a specific recipe (flat list)
   */
  getCommentsByRecipe(recipeId: string): Observable<CommentResponseDto[]> {
    return this.http.get<CommentResponseDto[]>(
      `${this.apiUrl}/recipe/${recipeId}`
    );
  }

  /**
   * Get comments with nested replies (tree structure)
   */
  getCommentsWithReplies(recipeId: string): Observable<CommentResponseDto[]> {
    return this.http.get<CommentResponseDto[]>(
      `${this.apiUrl}/recipe/${recipeId}/tree`
    );
  }

  /**
   * Get all comments by a specific user
   */
  getCommentsByUser(userId: string): Observable<CommentResponseDto[]> {
    return this.http.get<CommentResponseDto[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get replies for a specific comment
   */
  getRepliesByCommentId(commentId: string): Observable<CommentResponseDto[]> {
    return this.http.get<CommentResponseDto[]>(
      `${this.apiUrl}/${commentId}/replies`
    );
  }

  /**
   * Update a comment
   */
  updateComment(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto
  ): Observable<CommentResponseDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.put<CommentResponseDto>(
      `${this.apiUrl}/${commentId}`,
      dto,
      { params }
    );
  }

  /**
   * Delete a comment
   * @param deleteReplies - If true, deletes all nested replies. If false, keeps replies.
   */
  deleteComment(
    commentId: string,
    userId: string,
    deleteReplies: boolean = true
  ): Observable<void> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('deleteReplies', deleteReplies.toString());
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`, { params });
  }
}
