import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentService } from '../../core/services/comment.service';
import { ThemeService } from '../../core/services/theme.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { UserProfileService } from '../../core/services/user-profile.service';
import { RatingService } from '../../core/services/rating.service';
import { Recipe } from '../../core/models/recipe.models';
import {
  CommentResponseDto,
  CreateCommentDto,
} from '../../core/models/comment.models';
import { RatingResponseDto } from '../../core/models/rating.models';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzDividerModule,
    NzRateModule,
    NzInputModule,
    NzSpinModule,
    NzCardModule,
    NzAvatarModule,
    NzCommentModule,
    NzModalModule,
    PickerComponent,
  ],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.css',
})
export class RecipeDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private authService = inject(AuthService);
  private commentService = inject(CommentService);
  private favoriteService = inject(FavoriteService);
  private profileService = inject(UserProfileService);
  private ratingService = inject(RatingService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private fb = inject(FormBuilder);
  themeService = inject(ThemeService);

  recipe = signal<Recipe | null>(null);
  isLoading = signal(true);
  isFavorite = signal(false);
  isFavoriteLoading = signal(false);
  userRating = signal(0);
  userRatingData = signal<RatingResponseDto | null>(null);
  loadingRating = signal(false);
  comments = signal<CommentResponseDto[]>([]);
  loadingComments = signal(false);

  // Real-time animated stats
  animatedFavorites = signal(0);
  animatedRatings = signal(0);
  animatedComments = signal(0);
  animatedAvgRating = signal(0);

  // Real rating distribution (calculated from actual ratings)
  realRatingDistribution = signal<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  commentForm: FormGroup;
  submittingComment = signal(false);

  // Reply functionality
  replyingTo = signal<CommentResponseDto | null>(null);
  replyText = signal('');
  submittingReply = signal(false);

  // Edit functionality
  editingComment = signal<string | null>(null);
  editText = signal('');
  submittingEdit = signal(false);

  // Emoji picker - simplified to one state
  activeEmojiPicker = signal<'comment' | 'reply' | 'edit' | null>(null);
  activePickerId = signal<string | null>(null); // For reply/edit identification

  // Click outside handler for emoji picker
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.emoji-picker-wrapper') &&
      !target.closest('.emoji-btn')
    ) {
      this.closeAllEmojiPickers();
    }
  }

  constructor() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    const recipeId = this.route.snapshot.paramMap.get('id');
    if (recipeId) {
      this.loadRecipe(recipeId);
      this.loadComments(recipeId);
      this.checkFavoriteStatus(recipeId);
      this.loadUserRating(recipeId);
      this.loadRealRatingDistribution(recipeId);
    }
  }

  loadRecipe(id: string) {
    this.isLoading.set(true);
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.isLoading.set(false);
        // Initialize animated stats after recipe loads
        setTimeout(() => this.initializeAnimatedStats(), 100);
      },
      error: (error) => {
        this.message.error('Failed to load recipe details');
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
    });
  }

  checkFavoriteStatus(recipeId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.favoriteService.checkIfFavorite(currentUser.id, recipeId).subscribe({
      next: (response) => {
        this.isFavorite.set(response.isFavorite);
      },
      error: () => {
        // Silently fail - not critical
      },
    });
  }

  toggleFavorite() {
    const currentUser = this.authService.currentUser();
    const currentRecipe = this.recipe();

    if (!currentUser) {
      this.message.warning('Please login to save favorites');
      return;
    }

    if (!currentRecipe) return;

    this.isFavoriteLoading.set(true);
    this.favoriteService
      .toggleFavorite(currentUser.id, currentRecipe.id)
      .subscribe({
        next: (response) => {
          this.isFavorite.set(response.isFavorite);
          this.isFavoriteLoading.set(false);

          if (response.isFavorite) {
            this.profileService.incrementFavoriteCount();
            this.message.success('Recipe added to favorites! ❤️');
            // Real-time update: increment favorites count
            this.updateFavoritesCount(1);
            // Also reload recipe to get backend's updated count
            this.reloadRecipeStats();
          } else {
            this.profileService.decrementFavoriteCount();
            this.message.info('Recipe removed from favorites');
            // Real-time update: decrement favorites count
            this.updateFavoritesCount(-1);
            // Also reload recipe to get backend's updated count
            this.reloadRecipeStats();
          }
        },
        error: () => {
          this.message.error('Failed to update favorite status');
          this.isFavoriteLoading.set(false);
        },
      });
  }

  loadComments(recipeId: string) {
    this.loadingComments.set(true);
    this.commentService.getCommentsWithReplies(recipeId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loadingComments.set(false);
      },
      error: () => {
        this.message.error('Failed to load comments');
        this.loadingComments.set(false);
        this.comments.set([]);
      },
    });
  }

  loadUserRating(recipeId: string) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.loadingRating.set(true);
    this.ratingService
      .getUserRatingForRecipe(currentUser.id, recipeId)
      .subscribe({
        next: (rating) => {
          if (rating) {
            this.userRatingData.set(rating);
            this.userRating.set(rating.stars);
          } else {
            this.userRatingData.set(null);
            this.userRating.set(0);
          }
          this.loadingRating.set(false);
        },
        error: () => {
          this.loadingRating.set(false);
        },
      });
  }

  loadRealRatingDistribution(recipeId: string) {
    this.ratingService.getRatingsByRecipeId(recipeId).subscribe({
      next: (ratings) => {
        // Calculate real distribution from actual ratings
        const distribution: { [key: number]: number } = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };

        ratings.forEach((rating) => {
          if (rating.stars >= 1 && rating.stars <= 5) {
            distribution[rating.stars]++;
          }
        });

        this.realRatingDistribution.set(distribution);
      },
      error: () => {
        // Silently fail - will use simulated distribution as fallback
      },
    });
  }

  onRatingChange(stars: number) {
    const currentUser = this.authService.currentUser();
    const currentRecipe = this.recipe();

    if (!currentUser) {
      this.message.warning('Please login to rate this recipe');
      return;
    }

    if (!currentRecipe) return;

    this.loadingRating.set(true);

    // Create or update rating
    this.ratingService
      .createOrUpdateRating({
        recipeId: currentRecipe.id,
        userId: currentUser.id,
        stars: stars,
      })
      .subscribe({
        next: (rating) => {
          const wasNewRating = !this.userRatingData();
          this.userRatingData.set(rating);
          this.userRating.set(rating.stars);
          this.loadingRating.set(false);
          this.message.success('Rating saved successfully! ⭐');

          // Real-time update: increment ratings count if new rating
          if (wasNewRating) {
            this.updateRatingsCount(1);
          }

          // Reload recipe stats to get updated average rating and distribution
          this.reloadRecipeStats();

          // Reload real distribution
          this.loadRealRatingDistribution(currentRecipe.id);
        },
        error: (error) => {
          this.message.error(
            'Failed to save rating: ' +
              (error.error?.message || 'Unknown error')
          );
          this.loadingRating.set(false);
          // Revert to previous rating
          this.userRating.set(this.userRatingData()?.stars || 0);
        },
      });
  }

  getTotalTime(): number {
    const recipe = this.recipe();
    return recipe ? recipe.prepTime + recipe.cookTime : 0;
  }

  onSubmitComment() {
    if (this.commentForm.invalid) {
      Object.values(this.commentForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    const recipe = this.recipe();
    const currentUser = this.authService.currentUser();

    if (!recipe || !currentUser) {
      this.message.error('Please login to comment');
      return;
    }

    this.submittingComment.set(true);

    const payload = {
      recipeId: recipe.id,
      userId: currentUser.id,
      text: this.commentForm.value.comment,
    };

    this.commentService.createComment(payload).subscribe({
      next: (newComment) => {
        this.comments.update((comments) => [newComment, ...comments]);
        this.profileService.incrementCommentCount();
        this.message.success('Comment posted successfully!');
        this.commentForm.reset();
        this.submittingComment.set(false);
        // Real-time update: increment comments count
        this.updateCommentsCount(1);
      },
      error: (error) => {
        this.message.error(
          'Failed to post comment: ' + (error.error?.message || 'Unknown error')
        );
        this.submittingComment.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `{days} days ago`;
    return new Date(date).toLocaleDateString();
  }

  getUserInitials(userId: string): string {
    return userId.substring(0, 2).toUpperCase();
  }

  getTotalCommentCount(): number {
    const countReplies = (comment: CommentResponseDto): number => {
      let count = 1;
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply) => {
          count += countReplies(reply);
        });
      }
      return count;
    };

    return this.comments().reduce((total, comment) => {
      return total + countReplies(comment);
    }, 0);
  }

  getStarPercentage(stars: number): number {
    const recipe = this.recipe();
    const distribution = this.realRatingDistribution();

    // Calculate total ratings from distribution
    const total = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0
    );

    // If no ratings yet, return 0
    if (total === 0) return 0;

    // Calculate percentage from real data
    const count = distribution[stars] || 0;
    return Math.round((count / total) * 100);
  }

  getStarCount(stars: number): number {
    const distribution = this.realRatingDistribution();
    return distribution[stars] || 0;
  }

  // Simplified emoji picker methods
  closeAllEmojiPickers() {
    this.activeEmojiPicker.set(null);
    this.activePickerId.set(null);
  }

  toggleEmojiPicker() {
    const isOpen = this.activeEmojiPicker() === 'comment';
    this.closeAllEmojiPickers();
    if (!isOpen) {
      this.activeEmojiPicker.set('comment');
    }
  }

  toggleReplyEmojiPicker(commentId: string) {
    const isOpen =
      this.activeEmojiPicker() === 'reply' &&
      this.activePickerId() === commentId;
    this.closeAllEmojiPickers();
    if (!isOpen) {
      this.activeEmojiPicker.set('reply');
      this.activePickerId.set(commentId);
    }
  }

  toggleEditEmojiPicker(commentId: string) {
    const isOpen =
      this.activeEmojiPicker() === 'edit' &&
      this.activePickerId() === commentId;
    this.closeAllEmojiPickers();
    if (!isOpen) {
      this.activeEmojiPicker.set('edit');
      this.activePickerId.set(commentId);
    }
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const currentComment = this.commentForm.get('comment')?.value || '';
    this.commentForm.patchValue({
      comment: currentComment + emoji,
    });
    this.closeAllEmojiPickers();
  }

  addReplyEmoji(event: any) {
    const emoji = event.emoji.native;
    this.replyText.set(this.replyText() + emoji);
    this.closeAllEmojiPickers();
  }

  addEditEmoji(event: any) {
    const emoji = event.emoji.native;
    this.editText.update((text) => text + emoji);
    this.closeAllEmojiPickers();
  }

  startReply(comment: CommentResponseDto) {
    this.replyingTo.set(comment);
    this.replyText.set('');
    this.closeAllEmojiPickers();
  }

  cancelReply() {
    this.replyingTo.set(null);
    this.replyText.set('');
    this.closeAllEmojiPickers();
  }

  submitReply() {
    const replyTo = this.replyingTo();
    const text = this.replyText().trim();
    const currentUser = this.authService.currentUser();
    const recipe = this.recipe();

    if (!text || !replyTo || !currentUser || !recipe) {
      this.message.error('Please enter a reply');
      return;
    }

    this.submittingReply.set(true);

    const payload = {
      recipeId: recipe.id,
      userId: currentUser.id,
      text: text,
      parentCommentId: replyTo.id,
    };
    this.commentService.createComment(payload).subscribe({
      next: (newReply) => {
        // Recursively add reply to nested structure
        this.comments.update((comments) =>
          this.addReplyToTree(comments, replyTo.id, newReply)
        );

        this.profileService.incrementCommentCount();
        this.message.success('Reply posted successfully!');
        this.cancelReply();
        this.submittingReply.set(false);
        // Real-time update: increment comments count
        this.updateCommentsCount(1);
      },
      error: (error) => {
        console.error('Error posting reply:', error);
        this.message.error(
          'Failed to post reply: ' + (error.error?.message || 'Unknown error')
        );
        this.submittingReply.set(false);
      },
    });
  }

  startEdit(comment: CommentResponseDto) {
    this.editingComment.set(comment.id);
    this.editText.set(comment.text);
    this.closeAllEmojiPickers();
  }

  cancelEdit() {
    this.editingComment.set(null);
    this.editText.set('');
    this.closeAllEmojiPickers();
  }

  submitEdit(commentId: string) {
    const text = this.editText().trim();
    const currentUser = this.authService.currentUser();

    if (!text || !currentUser) {
      this.message.error('Please enter a comment');
      return;
    }

    this.submittingEdit.set(true);

    this.commentService
      .updateComment(commentId, currentUser.id, { text })
      .subscribe({
        next: (updatedComment) => {
          this.comments.update((comments) =>
            this.updateCommentInTree(comments, updatedComment)
          );

          this.message.success('Comment updated successfully!');
          this.cancelEdit();
          this.submittingEdit.set(false);
        },
        error: (error) => {
          console.error('Error updating comment:', error);
          this.message.error(
            'Failed to update comment: ' +
              (error.error?.message || 'Unknown error')
          );
          this.submittingEdit.set(false);
        },
      });
  }

  private updateCommentInTree(
    comments: CommentResponseDto[],
    updatedComment: CommentResponseDto
  ): CommentResponseDto[] {
    return comments.map((comment) => {
      if (comment.id === updatedComment.id) {
        return { ...comment, text: updatedComment.text };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: this.updateCommentInTree(comment.replies, updatedComment),
        };
      }
      return comment;
    });
  }

  // Helper to add reply to nested tree structure
  private addReplyToTree(
    comments: CommentResponseDto[],
    parentId: string,
    newReply: CommentResponseDto
  ): CommentResponseDto[] {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: this.addReplyToTree(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  }

  deleteComment(commentId: string, hasReplies: boolean = false) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const title = hasReplies ? 'Delete Comment & Replies?' : 'Delete Comment?';
    const content = hasReplies
      ? 'This comment has replies. Deleting it will also remove all nested replies. This action cannot be undone.'
      : 'Are you sure you want to delete this comment? This action cannot be undone.';

    const isDark = this.themeService.isDarkMode();

    this.modal.confirm({
      nzTitle: title,
      nzContent: content,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzClassName: isDark ? 'dark-modal' : '',
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          this.commentService
            .deleteComment(commentId, currentUser.id, hasReplies)
            .subscribe({
              next: () => {
                this.comments.update((comments) =>
                  this.removeCommentFromTree(comments, commentId)
                );

                this.profileService.decrementCommentCount();
                this.message.success('Comment deleted successfully!');
                // Real-time update: decrement comments count
                this.updateCommentsCount(-1);
                resolve();
              },
              error: (error) => {
                this.message.error(
                  'Failed to delete comment: ' +
                    (error.error?.message || 'Unknown error')
                );
                reject(error);
              },
            });
        }),
    });
  }

  private removeCommentFromTree(
    comments: CommentResponseDto[],
    commentId: string
  ): CommentResponseDto[] {
    return comments
      .filter((comment) => comment.id !== commentId)
      .map((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: this.removeCommentFromTree(comment.replies, commentId),
          };
        }
        return comment;
      });
  }

  isCommentOwner(comment: CommentResponseDto): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id === comment.userId;
  }

  // Real-time Stats Animation Methods
  private animateCountUp(
    from: number,
    to: number,
    signal: any,
    duration: number = 1000
  ) {
    const startTime = Date.now();
    const difference = to - from;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentValue = Math.round(
        from + difference * easeOutCubic(progress)
      );

      signal.set(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private initializeAnimatedStats() {
    const recipe = this.recipe();
    if (!recipe) return;

    // Animate all stats on page load
    this.animateCountUp(0, recipe.totalFavorites || 0, this.animatedFavorites);
    this.animateCountUp(0, recipe.totalRatings || 0, this.animatedRatings);
    this.animateCountUp(
      0,
      this.getTotalCommentCount(),
      this.animatedComments,
      1200
    );
  }

  updateFavoritesCount(delta: number) {
    const recipe = this.recipe();
    if (!recipe) return;

    const newCount = (recipe.totalFavorites || 0) + delta;
    recipe.totalFavorites = newCount;
    this.recipe.set({ ...recipe });

    // Animate the change
    this.animateCountUp(
      this.animatedFavorites(),
      newCount,
      this.animatedFavorites,
      500
    );
  }

  updateRatingsCount(delta: number) {
    const recipe = this.recipe();
    if (!recipe) return;

    const newCount = (recipe.totalRatings || 0) + delta;
    recipe.totalRatings = newCount;
    this.recipe.set({ ...recipe });

    // Animate the change
    this.animateCountUp(
      this.animatedRatings(),
      newCount,
      this.animatedRatings,
      500
    );
  }

  updateCommentsCount(delta: number) {
    const currentCount = this.animatedComments();
    const newCount = currentCount + delta;

    // Animate the change
    this.animateCountUp(currentCount, newCount, this.animatedComments, 500);
  }

  // Reload recipe stats from backend without re-animating from 0
  reloadRecipeStats() {
    const currentRecipe = this.recipe();
    if (!currentRecipe) return;

    this.recipeService.getRecipeById(currentRecipe.id).subscribe({
      next: (updatedRecipe) => {
        // Store current animated values
        const currentFavs = this.animatedFavorites();
        const currentRatings = this.animatedRatings();

        // Update recipe data
        this.recipe.set(updatedRecipe);

        // Animate from current displayed value to new backend value
        if (updatedRecipe.totalFavorites !== currentFavs) {
          this.animateCountUp(
            currentFavs,
            updatedRecipe.totalFavorites || 0,
            this.animatedFavorites,
            500
          );
        }

        if (updatedRecipe.totalRatings !== currentRatings) {
          this.animateCountUp(
            currentRatings,
            updatedRecipe.totalRatings || 0,
            this.animatedRatings,
            500
          );
        }
      },
      error: () => {
        // Silently fail - not critical for stats update
      },
    });
  }
}
