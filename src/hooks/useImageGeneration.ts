import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { createLiteLLMClient } from '../lib/litellm';

export const useImageGeneration = () => {
  const { apiKey, imageModel } = useSelector((state: RootState) => state.settings);

  return useCallback(async (prompt: string): Promise<string> => {
    if (!apiKey) throw new Error('API key missing');
    const client = createLiteLLMClient(apiKey);
    return client.generateImage(prompt, imageModel);
  }, [apiKey, imageModel]);
};

