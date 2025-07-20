export const AVAILABLE_MODELS = [
  'llama-3.1-70b-instruct',
  'llama-3.3-70b-instruct', 
  'llama-3.1-nemotron-nano-8B-v1',
  'mixtral-8x7b-instruct',
  'llama-3.1-8b-instruct',
  'mistral-7b-instruct',
  'mistral-small-3.1',
  'codestral-22b',
  'granite-3.1-8b-instruct',
  'gemma-3-27b-it',
  'kokoro'
] as const;

export const EMBEDDING_MODELS = [
  'nomic-embed-text-v1.5',
  'sfr-embedding-mistral',
  'gte-large-en-v1.5'
] as const;

export const IMAGE_MODELS = [
  'flux.1-schnell',
  'flux.1-dev'
] as const;

export const AUDIO_MODELS = [
  'whisper-large-v3'
] as const;

export type ModelType = typeof AVAILABLE_MODELS[number];
export type AudioModelType = typeof AUDIO_MODELS[number];
export type ImageModelType = typeof IMAGE_MODELS[number];
export type EmbeddingModelType = typeof EMBEDDING_MODELS[number];

