import { supabase } from '../../lib/supabase';
import type { Recipe, Ingredient } from '../../types/recipe';

export class RecipeService {
  async getRecipes() {
    return await supabase.from('recipes').select('*');
  }

  async getRecipeById(id: string) {
    return await supabase
      .from('recipes')
      .select(`
        *,
        ingredients (*),
        instructions (*)
      `)
      .eq('id', id)
      .single();
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) {
    return await supabase.from('recipes').insert(recipe);
  }
}

export const recipeService = new RecipeService();