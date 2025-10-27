import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ShoppingService } from '../app/services/shoppingService';

describe('ShoppingService', () => {
  test('getItemsForList maps raw rows to domain objects', async () => {
    const mockClient = {
      from: (table: string) => {
        assert.equal(table, 'shopping_items');
        return {
          select: (columns: string) => {
            assert.equal(columns, '*');
            return {
              eq: async (column: string, value: string) => {
                assert.equal(column, 'list_id');
                assert.equal(value, 'list-1');
                return {
                  data: [
                    {
                      id: 'item-1',
                      list_id: 'list-1',
                      ingredient_id: 'ingredient-1',
                      name: 'Carrot',
                      amount: 2,
                      unit: 'pieces',
                      category: 'Produce',
                      checked: false,
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:05:00.000Z',
                    },
                  ],
                  error: null,
                };
              },
            };
          },
        };
      },
    };

    const service = new ShoppingService(() => mockClient as any);
    const items = await service.getItemsForList('list-1');

    assert.deepEqual(items, [
      {
        id: 'item-1',
        listId: 'list-1',
        ingredientId: 'ingredient-1',
        name: 'Carrot',
        amount: 2,
        unit: 'pieces',
        category: 'Produce',
        checked: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:05:00.000Z',
      },
    ]);
  });

  test('attachRecipesToListItems enriches items with recipe metadata', async () => {
    const mockClient = {
      from: (table: string) => {
        assert.equal(table, 'shopping_items');
        return {
          select: (columns: string) => {
            assert.match(columns, /ingredients/);
            return {
              eq: async (column: string, value: string) => {
                assert.equal(column, 'list_id');
                assert.equal(value, 'list-1');
                return {
                  data: [
                    {
                      id: 'item-1',
                      list_id: 'list-1',
                      ingredient_id: 'ingredient-1',
                      name: 'Carrot',
                      amount: 2,
                      unit: 'pieces',
                      category: 'Produce',
                      checked: false,
                      created_at: '2024-01-01T00:00:00.000Z',
                      updated_at: '2024-01-01T00:05:00.000Z',
                      ingredients: {
                        recipe_id: 'recipe-1',
                        recipes: {
                          id: 'recipe-1',
                          title: 'Carrot Soup',
                          description: 'A cozy soup',
                          prep_time: 15,
                          cook_time: 30,
                          servings: 4,
                          image_url: null,
                          author_id: 'user-1',
                          created_at: '2024-01-01T00:00:00.000Z',
                          updated_at: '2024-01-02T00:00:00.000Z',
                        },
                      },
                    },
                    {
                      id: 'item-2',
                      list_id: 'list-1',
                      ingredient_id: null,
                      name: 'Salt',
                      amount: 1,
                      unit: 'teaspoon',
                      category: 'Pantry',
                      checked: true,
                      created_at: '2024-01-01T00:10:00.000Z',
                      updated_at: '2024-01-01T00:15:00.000Z',
                      ingredients: null,
                    },
                  ],
                  error: null,
                };
              },
            };
          },
        };
      },
    };

    const service = new ShoppingService(() => mockClient as any);
    const items = await service.attachRecipesToListItems('list-1');

    assert.deepEqual(items, [
      {
        id: 'item-1',
        listId: 'list-1',
        ingredientId: 'ingredient-1',
        name: 'Carrot',
        amount: 2,
        unit: 'pieces',
        category: 'Produce',
        checked: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:05:00.000Z',
        recipes: [{ id: 'recipe-1', title: 'Carrot Soup' }],
      },
      {
        id: 'item-2',
        listId: 'list-1',
        ingredientId: null,
        name: 'Salt',
        amount: 1,
        unit: 'teaspoon',
        category: 'Pantry',
        checked: true,
        createdAt: '2024-01-01T00:10:00.000Z',
        updatedAt: '2024-01-01T00:15:00.000Z',
        recipes: [],
      },
    ]);
  });

  test('addItemToList forwards normalized payload to Supabase', async () => {
    let capturedPayload: Record<string, unknown> | null = null;
    const mockClient = {
      from: (table: string) => {
        assert.equal(table, 'shopping_items');
        return {
          insert: async (payload: Record<string, unknown>) => {
            capturedPayload = payload;
            return { data: null, error: null };
          },
        };
      },
    };

    const service = new ShoppingService(() => mockClient as any);
    await service.addItemToList('list-1', {
      ingredientId: 'ingredient-1',
      name: 'Carrot',
      amount: 2,
      unit: 'pieces',
      category: 'Produce',
      checked: true,
    });

    assert.deepEqual(capturedPayload, {
      list_id: 'list-1',
      ingredient_id: 'ingredient-1',
      name: 'Carrot',
      amount: 2,
      unit: 'pieces',
      category: 'Produce',
      checked: true,
    });
  });
});
