export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: number;
  cost?: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
  totalTokens: number;
  totalCost: number;
}

export interface ChatSettings {
  model: string;
  imageModel: string;
  audioModel: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
  enableCache: boolean;
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

export interface Analytics {
  totalRequests: number;
  totalCost: number;
  averageLatency: number;
  cacheHitRate: number;
  requestsToday: number;
  costToday: number;
}