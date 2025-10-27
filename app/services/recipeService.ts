import {
  buildRecipeInsert,
  Ingredient,
  mapIngredientRowToIngredient,
  mapInstructionRowToInstruction,
  mapRecipeRowToRecipe,
  Recipe,
  RecipeInput,
  Instruction,
} from '../../types/recipe';
import { getSupabaseClient } from '../../lib/supabase';

export interface FullRecipe extends Recipe {
  ingredients: Ingredient[];
  instructions: Instruction[];
}

export class RecipeService {
  private get client() {
    return getSupabaseClient();
  }

  async getRecipes(): Promise<Recipe[]> {
    const { data, error } = await this.client.from('recipes').select('*');

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapRecipeRowToRecipe);
  }

  async getRecipeById(id: string): Promise<FullRecipe | null> {
    const { data, error } = await this.client
      .from('recipes')
      .select('*, ingredients (*), instructions (*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }

      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      ...mapRecipeRowToRecipe(data),
      ingredients: (data.ingredients ?? []).map(mapIngredientRowToIngredient),
      instructions: (data.instructions ?? []).map(mapInstructionRowToInstruction),
    };
  }

  async createRecipe(payload: RecipeInput): Promise<FullRecipe> {
    const client = this.client;
    const { recipe, ingredients, instructions } = buildRecipeInsert(payload);

    const { data: recipeData, error: recipeError } = await client
      .from('recipes')
      .insert(recipe)
      .select('*')
      .single();

    if (recipeError || !recipeData) {
      throw recipeError ?? new Error('Failed to create recipe record.');
    }

    const recipeId = recipeData.id;

    if (ingredients.length > 0) {
      const { error: ingredientError } = await client.from('ingredients').insert(
        ingredients.map((ingredient) => ({
          ...ingredient,
          recipe_id: recipeId,
        }))
      );

      if (ingredientError) {
        throw ingredientError;
      }
    }

    if (instructions.length > 0) {
      const { error: instructionError } = await client.from('instructions').insert(
        instructions.map((instruction) => ({
          ...instruction,
          recipe_id: recipeId,
        }))
      );

      if (instructionError) {
        throw instructionError;
      }
    }

    const fullRecipe = await this.getRecipeById(recipeId);

    if (!fullRecipe) {
      throw new Error('Failed to load recipe after creation.');
    }

    return fullRecipe;
  }
}

export const recipeService = new RecipeService();
