import { supabase } from '../../lib/supabase';
import type { ShoppingItem } from '../../types/recipe';

export class ShoppingService {
  async getShoppingLists(userId: string) {
    return await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId);
  }

  async createShoppingList(userId: string, name: string) {
    return await supabase
      .from('shopping_lists')
      .insert({ user_id: userId, name });
  }

  async addItemToList(listId: string, item: Omit<ShoppingItem, 'id'>) {
    return await supabase
      .from('shopping_items')
      .insert({ list_id: listId, ...item });
  }
}

export const shoppingService = new ShoppingService();