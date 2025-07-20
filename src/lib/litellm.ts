import OpenAI from 'openai';
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions';

const BASE_URL = 'https://api.ai.it.ufl.edu/v1';

export class LiteLLMClient {
  private client: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey,
      baseURL: BASE_URL,
      dangerouslyAllowBrowser: true
    });
  }

  async *streamChatCompletion(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    maxTokens?: number;
    enableCache?: boolean;
  }) {
    const headers: Record<string, string> = {};
    if (params.enableCache) {
      headers['litellm-cache'] = 'true';
    }

    const stream = await this.client.chat.completions.create({
      model: params.model,
      messages: params.messages as ChatCompletionCreateParamsStreaming['messages'],
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1000,
      stream: true,
    }, {
      headers
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  async transcribeAudio(audioBlob: Blob, model: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', model);

    const response = await fetch(`${BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text;
  }

  async generateImage(prompt: string, model: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, prompt, n: 1 }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data?.[0]?.url ?? '';
  }

  async createEmbedding(input: string, model: string): Promise<number[]> {
    const response = await fetch(`${BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input }),
    });

    if (!response.ok) {
      throw new Error(`Embedding failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data?.[0]?.embedding ?? [];
  }
}

export const createLiteLLMClient = (apiKey: string) => new LiteLLMClient(apiKey);
