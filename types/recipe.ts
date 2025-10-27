import type { Database } from '../lib/database.types';

export type GroceryCategory = Database['public']['Enums']['grocery_category'];

export const GROCERY_CATEGORY_VALUES: GroceryCategory[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Household',
  'Other',
];

export type RecipeRow = Database['public']['Tables']['recipes']['Row'];
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update'];

export type IngredientRow = Database['public']['Tables']['ingredients']['Row'];
export type IngredientInsert = Database['public']['Tables']['ingredients']['Insert'];
export type IngredientUpdate = Database['public']['Tables']['ingredients']['Update'];

export type InstructionRow = Database['public']['Tables']['instructions']['Row'];
export type InstructionInsert = Database['public']['Tables']['instructions']['Insert'];
export type InstructionUpdate = Database['public']['Tables']['instructions']['Update'];

export type ShoppingItemRow = Database['public']['Tables']['shopping_items']['Row'];
export type ShoppingItemInsert = Database['public']['Tables']['shopping_items']['Insert'];
export type ShoppingItemUpdate = Database['public']['Tables']['shopping_items']['Update'];

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  recipeId: string;
  name: string;
  amount: number;
  unit: string;
  category: GroceryCategory;
  createdAt: string;
}

export interface Instruction {
  id: string;
  recipeId: string;
  stepNumber: number;
  content: string;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  ingredientId: string | null;
  name: string | null;
  amount: number;
  unit: string;
  category: GroceryCategory;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
  recipes?: { id: string; title: string }[];
  totalAmount?: string;
}

export interface RecipeInput {
  title: string;
  description?: string | null;
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl?: string | null;
  authorId: string;
  ingredients: Omit<IngredientInput, 'recipeId' | 'id' | 'createdAt'>[];
  instructions: Omit<InstructionInput, 'recipeId' | 'id' | 'createdAt'>[];
}

export interface IngredientInput {
  id?: string;
  recipeId: string;
  name: string;
  amount: number;
  unit: string;
  category: GroceryCategory;
  createdAt?: string;
}

export interface InstructionInput {
  id?: string;
  recipeId: string;
  stepNumber: number;
  content: string;
  createdAt?: string;
}

export interface ShoppingItemInput {
  ingredientId?: string | null;
  name?: string | null;
  amount: number;
  unit: string;
  category: GroceryCategory;
  checked?: boolean;
}

export function mapRecipeRowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    imageUrl: row.image_url,
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapIngredientRowToIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    name: row.name,
    amount: row.amount,
    unit: row.unit,
    category: row.category,
    createdAt: row.created_at,
  };
}

export function mapInstructionRowToInstruction(row: InstructionRow): Instruction {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    stepNumber: row.step_number,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function buildRecipeInsert(payload: RecipeInput): {
  recipe: RecipeInsert;
  ingredients: IngredientInsert[];
  instructions: InstructionInsert[];
} {
  const now = new Date().toISOString();
  const recipe: RecipeInsert = {
    title: payload.title,
    description: payload.description ?? null,
    prep_time: payload.prepTime,
    cook_time: payload.cookTime,
    servings: payload.servings,
    image_url: payload.imageUrl ?? null,
    author_id: payload.authorId,
    created_at: now,
    updated_at: now,
  };

  const ingredients: IngredientInsert[] = payload.ingredients.map((ingredient) => ({
    name: ingredient.name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    category: ingredient.category,
    recipe_id: '',
    created_at: now,
  }));

  const instructions: InstructionInsert[] = payload.instructions.map((instruction, index) => ({
    content: instruction.content,
    step_number: instruction.stepNumber ?? index + 1,
    recipe_id: '',
    created_at: now,
  }));

  return { recipe, ingredients, instructions };
}
