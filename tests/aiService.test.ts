import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AIService } from '../services/ai';

type ModelResponse = {
  response: Promise<{
    text(): string;
  }>;
};

class StubGenerativeModel {
  private readonly responseText: string;
  public readonly prompts: string[] = [];

  constructor(responseText: string) {
    this.responseText = responseText;
  }

  async generateContent(prompt: string): Promise<ModelResponse> {
    this.prompts.push(prompt);
    return {
      response: Promise.resolve({
        text: () => this.responseText,
      }),
    };
  }
}

function createClientWithResponses(responses: string[]) {
  const models = responses.map((text) => new StubGenerativeModel(text));
  let index = 0;
  return {
    models,
    getGenerativeModel: () => {
      const model = models[index];
      if (!model) {
        throw new Error('No stub model available for requested generative model.');
      }
      index += 1;
      return model;
    },
  };
}

describe('AIService', () => {
  const originalKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_GEMINI_API_KEY = originalKey;
    }
  });

  test('isConfigured returns false when API key is missing', () => {
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const service = new AIService(() => {
      throw new Error('Client factory should not be invoked without an API key');
    });
    assert.equal(service.isConfigured(), false);
  });

  describe('categorizeIngredients', () => {
    beforeEach(() => {
      process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-key';
    });

    test('parses sanitized JSON responses from the model', async () => {
      const client = createClientWithResponses([
        '\n```json\n[{"name":"Carrot","amount":2,"unit":"pieces","category":"Produce"}]\n```\n',
        '',
      ]) as any;
      const service = new AIService(() => client);

      const result = await service.categorizeIngredients(['2 carrots']);

      assert.deepEqual(result, [
        {
          name: 'Carrot',
          amount: 2,
          unit: 'pieces',
          category: 'Produce',
        },
      ]);
      assert.equal(client.models[0].prompts.length, 1);
      assert.match(client.models[0].prompts[0], /Categorize/);
    });
  });
});
