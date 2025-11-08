import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { RecipeService } from '../../../core/services/recipe.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-create-recipe-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzInputNumberModule,
    NzUploadModule,
    NzStepsModule,
  ],
  templateUrl: './create-recipe-modal.component.html',
  styleUrl: './create-recipe-modal.component.css',
})
export class CreateRecipeModalComponent {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);
  themeService = inject(ThemeService);

  @Output() recipeCreated = new EventEmitter<void>();

  isVisible = false;
  isSubmitting = signal(false);
  currentStep = signal(0);
  imageUrl = signal<string | null>(null);
  fileList: NzUploadFile[] = [];

  recipeForm: FormGroup;

  categories = [
    { label: 'Main Course', value: 'main-course' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Appetizer', value: 'appetizer' },
    { label: 'Soup', value: 'soup' },
    { label: 'Salad', value: 'salad' },
  ];

  difficulties = [
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
  ];

  constructor() {
    this.recipeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      difficulty: ['', [Validators.required]],
      prepTime: [0, [Validators.required, Validators.min(1)]],
      cookTime: [0, [Validators.required, Validators.min(1)]],
      imageUrl: [''],
      ingredients: this.fb.array([this.createIngredient()]),
      steps: this.fb.array([this.createStep()]),
    });
  }

  createIngredient(): FormGroup {
    return this.fb.group({
      item: ['', [Validators.required]],
    });
  }

  createStep(): FormGroup {
    return this.fb.group({
      instruction: ['', [Validators.required]],
    });
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addStep(): void {
    this.steps.push(this.createStep());
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  showModal(): void {
    this.isVisible = true;
    this.currentStep.set(0);
  }

  handleCancel(): void {
    this.isVisible = false;
    this.resetForm();
  }

  nextStep(): void {
    if (this.currentStep() < 2) {
      // Validate current step before proceeding
      if (this.currentStep() === 0) {
        const basicFields = [
          'title',
          'description',
          'category',
          'difficulty',
          'prepTime',
          'cookTime',
        ];
        const isValid = basicFields.every(
          (field) => this.recipeForm.get(field)?.valid
        );

        if (!isValid) {
          basicFields.forEach((field) => {
            this.recipeForm.get(field)?.markAsDirty();
            this.recipeForm.get(field)?.updateValueAndValidity();
          });
          this.message.warning('Please fill in all required fields');
          return;
        }
      }

      this.currentStep.update((step) => step + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((step) => step - 1);
    }
  }

  handleImageUpload = (file: NzUploadFile): boolean => {
    // Convert file to base64 or upload to server
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl.set(e.target.result);
      this.recipeForm.patchValue({ imageUrl: e.target.result });
    };
    reader.readAsDataURL(file as any);
    return false; // Prevent auto upload
  };

  handleSubmit(): void {
    if (this.recipeForm.invalid) {
      Object.values(this.recipeForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      this.message.error('Please fill in all required fields correctly');
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.message.error('Please login to create recipes');
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.recipeForm.value;
    const payload = {
      ...formValue,
      userId: currentUser.id,
      ingredients: formValue.ingredients.map((ing: any) => ing.item),
      steps: formValue.steps.map((step: any) => step.instruction),
    };

    this.recipeService.createRecipe(payload).subscribe({
      next: (recipe) => {
        this.message.success('Recipe created successfully! 🎉');
        this.isSubmitting.set(false);
        this.isVisible = false;
        this.resetForm();
        this.recipeCreated.emit();
      },
      error: (error) => {
        console.error('Error creating recipe:', error);
        this.message.error('Failed to create recipe. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  resetForm(): void {
    this.recipeForm.reset();
    this.currentStep.set(0);
    this.imageUrl.set(null);
    this.fileList = [];

    // Reset arrays to have at least one item
    while (this.ingredients.length > 1) {
      this.ingredients.removeAt(1);
    }
    while (this.steps.length > 1) {
      this.steps.removeAt(1);
    }
  }
}
