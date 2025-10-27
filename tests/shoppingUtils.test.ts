import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { consolidateShoppingList, formatAmount } from '../utils/shopping';
import { Ingredient } from '../types/recipe';

describe('shopping utils', () => {
  test('consolidateShoppingList groups ingredients by name and unit', () => {
    const ingredients: Ingredient[] = [
      {
        id: 'ingredient-1',
        recipeId: 'recipe-1',
        name: 'Carrot',
        amount: 1,
        unit: 'cup',
        category: 'Produce',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'ingredient-2',
        recipeId: 'recipe-2',
        name: 'Carrot',
        amount: 0.5,
        unit: 'cup',
        category: 'Produce',
        createdAt: '2024-01-01T00:05:00.000Z',
      },
      {
        id: 'ingredient-3',
        recipeId: 'recipe-3',
        name: 'Salt',
        amount: 1,
        unit: 'teaspoon',
        category: 'Pantry',
        createdAt: '2024-01-01T00:10:00.000Z',
      },
    ];

    const recipes = [
      { id: 'recipe-1', title: 'Soup' },
      { id: 'recipe-2', title: 'Stew' },
    ];

    const result = consolidateShoppingList(ingredients, recipes);

    assert.equal(result.length, 1);
    assert.deepEqual(result[0], {
      name: 'Carrot',
      amounts: [
        { amount: 1.5, unit: 'cup' },
      ],
      category: 'Produce',
      recipes: [
        { id: 'recipe-1', title: 'Soup' },
        { id: 'recipe-2', title: 'Stew' },
      ],
    });
  });

  test('formatAmount renders plural units correctly', () => {
    const formatted = formatAmount([
      { amount: 1, unit: 'cup' },
      { amount: 2, unit: 'teaspoon' },
    ]);

    assert.equal(formatted, '1 cup + 2 teaspoons');
  });
});
