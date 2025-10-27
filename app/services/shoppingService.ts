import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../lib/supabase';
import {
  ShoppingItem,
  ShoppingItemInput,
  mapRecipeRowToRecipe,
} from '../../types/recipe';
import type { Database } from '../../lib/database.types';

export class ShoppingService {
  constructor(private readonly clientProvider: () => SupabaseClient<Database> = () => getSupabaseClient()) {}

  private get client() {
    return this.clientProvider();
  }

  async getShoppingLists(userId: string) {
    return await this.client
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId);
  }

  async getItemsForList(listId: string): Promise<ShoppingItem[]> {
    const { data, error } = await this.client
      .from('shopping_items')
      .select('*')
      .eq('list_id', listId);

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      listId: item.list_id,
      ingredientId: item.ingredient_id,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
      checked: item.checked,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async addItemToList(listId: string, item: ShoppingItemInput) {
    const payload = {
      list_id: listId,
      ingredient_id: item.ingredientId ?? null,
      name: item.name ?? null,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
      checked: item.checked ?? false,
    };

    return await this.client.from('shopping_items').insert(payload);
  }

  async attachRecipesToListItems(listId: string): Promise<ShoppingItem[]> {
    const client = this.client;

    const { data, error } = await client
      .from('shopping_items')
      .select(
        `*, ingredients ( recipe_id, recipes (*))`
      )
      .eq('list_id', listId);

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => {
      const recipe = item.ingredients?.recipes
        ? mapRecipeRowToRecipe(item.ingredients.recipes)
        : null;

      return {
        id: item.id,
        listId: item.list_id,
        ingredientId: item.ingredient_id,
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        category: item.category,
        checked: item.checked,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        recipes: recipe ? [{ id: recipe.id, title: recipe.title }] : [],
      };
    });
  }
}

export const shoppingService = new ShoppingService();
