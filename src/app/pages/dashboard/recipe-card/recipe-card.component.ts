import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

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
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  isFavorited = signal(false);

  onViewRecipe() {
    console.log('View recipe:', this.recipe);
  }

  toggleFavorite() {
    this.isFavorited.set(!this.isFavorited());
  }
}
