import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { GROCERY_CATEGORY_VALUES, GroceryCategory } from '../types/recipe';

type InlineDataPart = {
  inlineData: {
    data: string;
    mimeType: string;
  };
};

type GeminiClient = {
  getGenerativeModel(config: { model: string }): GenerativeModel;
};

const GEMINI_MODEL = 'gemini-2.5-flash';

export interface VideoGenerationConfig {
  recipe: {
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
  };
  style: {
    aspectRatio: '9:16' | '16:9' | '1:1';
    duration: number;
    music: 'upbeat' | 'relaxing' | 'none';
    transitions: 'minimal' | 'dynamic';
  };
}

export interface ParsedIngredient {
  name: string;
  amount: number;
  unit: string;
  category: GroceryCategory;
}

export class AIService {
  private readonly client: GeminiClient | null;
  private readonly textModel: GenerativeModel | null;
  private readonly multimodalModel: GenerativeModel | null;

  constructor(clientFactory: (apiKey: string) => GeminiClient = (apiKey) => new GoogleGenerativeAI(apiKey)) {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key is not configured. AI features will be disabled.');
      this.client = null;
      this.textModel = null;
      this.multimodalModel = null;
      return;
    }

    this.client = clientFactory(apiKey);
    this.textModel = this.client.getGenerativeModel({ model: GEMINI_MODEL });
    this.multimodalModel = this.client.getGenerativeModel({ model: GEMINI_MODEL });
  }

  isConfigured(): boolean {
    return Boolean(this.client && this.textModel && this.multimodalModel);
  }

  async generateRecipeVideo(config: VideoGenerationConfig): Promise<string> {
    const model = this.getTextModel();

    try {
      const prompt = this.buildVideoPrompt(config);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Failed to generate video:', error);
      throw new Error('Video generation failed');
    }
  }

  private buildVideoPrompt(config: VideoGenerationConfig): string {
    return `
Create a viral cooking video for ${config.recipe.title} with the following specifications:

Style:
- Aspect Ratio: ${config.style.aspectRatio}
- Duration: ${config.style.duration} seconds
- Music: ${config.style.music}
- Transitions: ${config.style.transitions}

Recipe Details:
- Prep Time: ${config.recipe.prepTime} minutes
- Cook Time: ${config.recipe.cookTime} minutes
- Servings: ${config.recipe.servings}

Ingredients:
${config.recipe.ingredients.map(i => `- ${i}`).join('\n')}

Instructions:
${config.recipe.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Please generate a visually appealing, step-by-step cooking video optimized for social media sharing.
Include dynamic text overlays, engaging transitions, and proper pacing for each step.
    `.trim();
  }

  async parseRecipeFromImage(imageUri: string): Promise<{
    ingredients: ParsedIngredient[];
    instructions: string[];
    title?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
  }> {
    const model = this.getMultimodalModel();

    try {
      const prompt = `
Analyze this recipe image and extract the following information in JSON format:
{
  "title": "Recipe title if visible",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": number,
      "unit": "measurement unit",
      "category": "one of: ${GROCERY_CATEGORY_VALUES.join(', ')}"
    }
  ],
  "instructions": ["step 1", "step 2", ...],
  "prepTime": "preparation time in minutes if specified",
  "cookTime": "cooking time in minutes if specified",
  "servings": "number of servings if specified"
}

For ingredients, categorize each item into the most appropriate grocery category.
Parse amounts into numerical values and standardize units.
      `.trim();

      const imagePart = await this.loadImageAsInlineData(imageUri);
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      return this.parseJsonResponse(text);
    } catch (error) {
      console.error('Failed to parse recipe from image:', error);
      throw new Error('Recipe parsing failed');
    }
  }

  async categorizeIngredients(ingredients: string[]): Promise<ParsedIngredient[]> {
    const model = this.getTextModel();

    try {
      const prompt = `
Analyze these ingredients and categorize them. Return a JSON array with parsed amounts and appropriate grocery categories:
[
  {
    "name": "ingredient name",
    "amount": number,
    "unit": "measurement unit",
    "category": "one of: ${GROCERY_CATEGORY_VALUES.join(', ')}"
  }
]

Input ingredients:
${ingredients.join('\n')}

Guidelines:
- Parse ingredient amounts into numerical values
- Standardize units (e.g., cups, tablespoons, ounces)
- Categorize each ingredient into the most appropriate grocery section
- Handle combined measurements (e.g., "1 1/2 cups" should be 1.5)
      `.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return this.parseJsonResponse(response.text());
    } catch (error) {
      console.error('Failed to categorize ingredients:', error);
      throw new Error('Ingredient categorization failed');
    }
  }

  private getTextModel(): GenerativeModel {
    if (!this.textModel) {
      throw new Error('Gemini text model is not configured.');
    }
    return this.textModel;
  }

  private getMultimodalModel(): GenerativeModel {
    if (!this.multimodalModel) {
      throw new Error('Gemini multimodal model is not configured.');
    }
    return this.multimodalModel;
  }

  private async loadImageAsInlineData(imageUri: string): Promise<InlineDataPart> {
    if (imageUri.startsWith('http')) {
      const tempFile = `${FileSystem.cacheDirectory}gemini-${Date.now()}`;
      const download = await FileSystem.downloadAsync(imageUri, tempFile);
      try {
        const data = await FileSystem.readAsStringAsync(download.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mimeType = this.resolveMimeType(download.headers?.['Content-Type'] ?? imageUri);
        return { inlineData: { data, mimeType } };
      } finally {
        await FileSystem.deleteAsync(tempFile, { idempotent: true });
      }
    }

    const data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mimeType = this.resolveMimeType(imageUri);
    return { inlineData: { data, mimeType } };
  }

  private resolveMimeType(source: string): string {
    const normalized = source.toLowerCase();
    if (normalized.includes('png')) return 'image/png';
    if (normalized.includes('gif')) return 'image/gif';
    if (normalized.includes('webp')) return 'image/webp';
    return 'image/jpeg';
  }

  private parseJsonResponse<T>(raw: string): T {
    const sanitized = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const firstCurly = sanitized.indexOf('{');
    const firstBracket = sanitized.indexOf('[');
    const startCandidates = [firstCurly, firstBracket].filter((index) => index !== -1);
    const startIndex = startCandidates.length > 0 ? Math.min(...startCandidates) : -1;

    const lastCurly = sanitized.lastIndexOf('}');
    const lastBracket = sanitized.lastIndexOf(']');
    const endIndex = Math.max(lastCurly, lastBracket);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Model response did not contain valid JSON.');
    }

    const jsonString = sanitized.slice(startIndex, endIndex + 1);

    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Failed to parse model JSON response:', error, jsonString);
      throw new Error('Model response contained invalid JSON.');
    }
  }
}

export const aiService = new AIService();
