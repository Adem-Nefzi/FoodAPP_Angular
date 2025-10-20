import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  difficulty: string;
  rating: number;
  calories: number;
  servings: number;
  tags: string[];
  category: string;
}

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [
    CommonModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzPaginationModule,
    RecipeCardComponent,
  ],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipesListComponent {
  searchQuery = signal('');
  selectedCategory = signal('All Recipes');
  currentPage = signal(1);
  pageSize = signal(12);
  sortBy = signal('popular');
  isDarkMode = signal(false);

  categories = [
    'All Recipes',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snacks',
  ];

  recipes: Recipe[] = [
    {
      id: 1,
      title: 'Classic Chicken Pasta',
      description: 'Creamy pasta with tender chicken pieces',
      image: '/api/placeholder/300/200',
      cookTime: 25,
      difficulty: 'Easy',
      rating: 4.8,
      calories: 450,
      servings: 4,
      tags: ['Pasta', 'Chicken', 'Italian'],
      category: 'Lunch',
    },
    {
      id: 2,
      title: 'Grilled Salmon',
      description: 'Fresh salmon with lemon and herbs',
      image: '/api/placeholder/300/200',
      cookTime: 20,
      difficulty: 'Medium',
      rating: 4.9,
      calories: 380,
      servings: 2,
      tags: ['Fish', 'Healthy', 'Grilled'],
      category: 'Dinner',
    },
    {
      id: 3,
      title: 'Chocolate Cake',
      description: 'Rich and moist chocolate cake',
      image: '/api/placeholder/300/200',
      cookTime: 45,
      difficulty: 'Medium',
      rating: 4.7,
      calories: 320,
      servings: 8,
      tags: ['Dessert', 'Chocolate', 'Baking'],
      category: 'Dessert',
    },
    {
      id: 4,
      title: 'Vegetable Stir Fry',
      description: 'Colorful mix of fresh vegetables',
      image: '/api/placeholder/300/200',
      cookTime: 15,
      difficulty: 'Easy',
      rating: 4.6,
      calories: 220,
      servings: 3,
      tags: ['Vegetarian', 'Healthy', 'Quick'],
      category: 'Lunch',
    },
    {
      id: 5,
      title: 'Pancakes',
      description: 'Fluffy pancakes with maple syrup',
      image: '/api/placeholder/300/200',
      cookTime: 20,
      difficulty: 'Easy',
      rating: 4.8,
      calories: 280,
      servings: 4,
      tags: ['Breakfast', 'Sweet', 'Easy'],
      category: 'Breakfast',
    },
    {
      id: 6,
      title: 'Caesar Salad',
      description: 'Fresh romaine with parmesan',
      image: '/api/placeholder/300/200',
      cookTime: 10,
      difficulty: 'Easy',
      rating: 4.5,
      calories: 180,
      servings: 2,
      tags: ['Salad', 'Healthy', 'Quick'],
      category: 'Lunch',
    },
    {
      id: 7,
      title: 'Beef Tacos',
      description: 'Seasoned beef with fresh toppings',
      image: '/api/placeholder/300/200',
      cookTime: 20,
      difficulty: 'Easy',
      rating: 4.7,
      calories: 350,
      servings: 4,
      tags: ['Mexican', 'Beef', 'Quick'],
      category: 'Dinner',
    },
    {
      id: 8,
      title: 'Brownies',
      description: 'Fudgy chocolate brownies',
      image: '/api/placeholder/300/200',
      cookTime: 35,
      difficulty: 'Easy',
      rating: 4.9,
      calories: 280,
      servings: 12,
      tags: ['Dessert', 'Chocolate', 'Baking'],
      category: 'Dessert',
    },
  ];

  filteredRecipes = computed(() => {
    let filtered = this.recipes;

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
      filtered = filtered.filter((r) => r.category === this.selectedCategory());
    }

    // Sort
    switch (this.sortBy()) {
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'time':
        filtered = [...filtered].sort((a, b) => a.cookTime - b.cookTime);
        break;
      case 'recent':
        // Assuming newer recipes have higher IDs
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
      // 'popular' is the default order
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
}
