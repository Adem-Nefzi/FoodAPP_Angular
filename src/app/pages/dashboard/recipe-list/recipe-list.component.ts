import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { CreateRecipeModalComponent } from '../create-recipe-modal/create-recipe-modal.component';
import { RecipeService } from '../../../core/services/recipe.service';
import { Recipe } from '../../../core/models/recipe.models';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [
    CommonModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzPaginationModule,
    NzSpinModule,
    RecipeCardComponent,
    CreateRecipeModalComponent,
  ],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipesListComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private message = inject(NzMessageService);

  @ViewChild(CreateRecipeModalComponent)
  createRecipeModal!: CreateRecipeModalComponent;

  // UI State
  searchQuery = signal('');
  selectedCategory = signal('All Recipes');
  currentPage = signal(1);
  pageSize = signal(12);
  sortBy = signal('popular');
  isDarkMode = signal(false);
  isLoading = signal(false);

  // Data
  recipes = signal<Recipe[]>([]);

  // Categories mapping (backend categories to display names)
  categories = [
    'All Recipes',
    'Main Course',
    'Dessert',
    'Appetizer',
    'Soup',
    'Salad',
  ];

  // Category mapping for backend
  private categoryMap: Record<string, string> = {
    'All Recipes': '',
    'Main Course': 'main-course',
    Dessert: 'dessert',
    Appetizer: 'appetizer',
    Soup: 'soup',
    Salad: 'salad',
  };

  ngOnInit() {
    this.loadRecipes();
  }

  /**
   * Load recipes from backend
   */
  loadRecipes() {
    this.isLoading.set(true);

    // Fetch all recipes (approval system not implemented yet)
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => {
        console.log('Loaded recipes:', recipes);
        this.recipes.set(recipes);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
        this.message.error(
          'Failed to load recipes. Please check if the backend is running.'
        );
        this.isLoading.set(false);
      },
    });
  }

  filteredRecipes = computed(() => {
    let filtered = this.recipes();

    // Filter by search
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory() !== 'All Recipes') {
      const backendCategory = this.categoryMap[this.selectedCategory()];
      filtered = filtered.filter((r) => r.category === backendCategory);
    }

    // Sort
    switch (this.sortBy()) {
      case 'rating':
        filtered = [...filtered].sort(
          (a, b) => b.averageRating - a.averageRating
        );
        break;
      case 'time':
        filtered = [...filtered].sort(
          (a, b) => a.prepTime + a.cookTime - (b.prepTime + b.cookTime)
        );
        break;
      case 'recent':
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      // 'popular' is the default order (by rating)
      default:
        filtered = [...filtered].sort(
          (a, b) => b.averageRating - a.averageRating
        );
    }

    return filtered;
  });

  paginatedRecipes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredRecipes().slice(start, start + this.pageSize());
  });

  featuredRecipe = computed(() => {
    return this.filteredRecipes().length > 0 ? this.filteredRecipes()[0] : null;
  });

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
  }

  onSortChange(sort: string) {
    this.sortBy.set(sort);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onViewRecipe(recipe: Recipe) {
    console.log('View recipe:', recipe);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('All Recipes');
    this.currentPage.set(1);
  }

  openCreateRecipeModal() {
    this.createRecipeModal.showModal();
  }

  onRecipeCreated() {
    this.loadRecipes();
  }
}
