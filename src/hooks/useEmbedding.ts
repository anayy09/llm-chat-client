import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { createLiteLLMClient } from '../lib/litellm';

export const useEmbedding = () => {
  const { apiKey, embeddingModel } = useSelector((state: RootState) => state.settings);

  return useCallback(async (input: string): Promise<number[]> => {
    if (!apiKey) throw new Error('API key missing');
    const client = createLiteLLMClient(apiKey);
    return client.createEmbedding(input, embeddingModel);
  }, [apiKey, embeddingModel]);
};

