import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRecipeInsert,
  mapIngredientRowToIngredient,
  mapInstructionRowToInstruction,
  mapRecipeRowToRecipe,
  RecipeInput,
  RecipeRow,
  IngredientRow,
  InstructionRow,
} from '../types/recipe';

describe('recipe mappers', () => {
  test('mapRecipeRowToRecipe converts snake_case to camelCase fields', () => {
    const row: RecipeRow = {
      id: 'recipe-1',
      title: 'Carrot Soup',
      description: 'A cozy soup',
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      image_url: 'https://example.com/image.jpg',
      author_id: 'user-1',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
    };

    const result = mapRecipeRowToRecipe(row);

    assert.deepEqual(result, {
      id: 'recipe-1',
      title: 'Carrot Soup',
      description: 'A cozy soup',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      imageUrl: 'https://example.com/image.jpg',
      authorId: 'user-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    });
  });

  test('mapIngredientRowToIngredient normalizes properties', () => {
    const row: IngredientRow = {
      id: 'ingredient-1',
      recipe_id: 'recipe-1',
      name: 'Carrot',
      amount: 3,
      unit: 'pieces',
      category: 'Produce',
      created_at: '2024-01-01T00:00:00.000Z',
    };

    const result = mapIngredientRowToIngredient(row);

    assert.deepEqual(result, {
      id: 'ingredient-1',
      recipeId: 'recipe-1',
      name: 'Carrot',
      amount: 3,
      unit: 'pieces',
      category: 'Produce',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });

  test('mapInstructionRowToInstruction reshapes step data', () => {
    const row: InstructionRow = {
      id: 'instruction-1',
      recipe_id: 'recipe-1',
      step_number: 2,
      content: 'Simmer for 20 minutes',
      created_at: '2024-01-01T00:05:00.000Z',
    };

    const result = mapInstructionRowToInstruction(row);

    assert.deepEqual(result, {
      id: 'instruction-1',
      recipeId: 'recipe-1',
      stepNumber: 2,
      content: 'Simmer for 20 minutes',
      createdAt: '2024-01-01T00:05:00.000Z',
    });
  });

  test('buildRecipeInsert prepares payloads for Supabase tables', () => {
    const payload: RecipeInput = {
      title: 'Carrot Soup',
      description: 'A cozy soup',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      imageUrl: null,
      authorId: 'user-1',
      ingredients: [
        {
          name: 'Carrot',
          amount: 3,
          unit: 'pieces',
          category: 'Produce',
        },
      ],
      instructions: [
        {
          stepNumber: 1,
          content: 'Chop carrots',
        },
        {
          stepNumber: 2,
          content: 'Simmer until tender',
        },
      ],
    };

    const { recipe, ingredients, instructions } = buildRecipeInsert(payload);

    assert.equal(recipe.title, 'Carrot Soup');
    assert.equal(recipe.prep_time, 15);
    assert.equal(recipe.cook_time, 30);
    assert.equal(recipe.servings, 4);
    assert.equal(recipe.image_url, null);
    assert.equal(recipe.author_id, 'user-1');
    assert.equal(typeof recipe.created_at, 'string');
    const timestamp = recipe.created_at as string;
    assert.equal(timestamp, recipe.updated_at);
    assert.ok(Number.isFinite(Date.parse(timestamp)));

    assert.deepEqual(ingredients, [
      {
        name: 'Carrot',
        amount: 3,
        unit: 'pieces',
        category: 'Produce',
        recipe_id: '',
        created_at: recipe.created_at,
      },
    ]);

    assert.deepEqual(instructions, [
      {
        content: 'Chop carrots',
        step_number: 1,
        recipe_id: '',
        created_at: recipe.created_at,
      },
      {
        content: 'Simmer until tender',
        step_number: 2,
        recipe_id: '',
        created_at: recipe.created_at,
      },
    ]);
  });
});
