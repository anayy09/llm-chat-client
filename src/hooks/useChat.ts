import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addMessage, updateMessage, setLoading, setError } from '../store/chatSlice';
import { incrementRequests, addCost } from '../store/analyticsSlice';
import { createLiteLLMClient } from '../lib/litellm';
import { costTracker } from '../lib/costTracker';
import type { Message } from '../types';

export const useChat = () => {
  const dispatch = useDispatch();
  const { activeChat, chats, isLoading } = useSelector((state: RootState) => state.chat);
  const { apiKey, model, temperature, maxTokens, enableCache } = useSelector((state: RootState) => state.settings);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeChat || !apiKey || isLoading) return;

    const chat = chats.find(c => c.id === activeChat);
    if (!chat) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    dispatch(addMessage({ chatId: activeChat, message: userMessage }));
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    dispatch(addMessage({ chatId: activeChat, message: assistantMessage }));

    try {
      const client = createLiteLLMClient(apiKey);
      const startTime = Date.now();
      
      abortControllerRef.current = new AbortController();
      
      const messages = [...chat.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullContent = '';
      let firstToken = true;

      const stream = client.streamChatCompletion({
        model,
        messages,
        temperature,
        maxTokens,
        enableCache,
      });

      for await (const chunk of stream) {
        if (abortControllerRef.current?.signal.aborted) break;

        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          if (firstToken) {
            const latency = Date.now() - startTime;
            console.log(`First token latency: ${latency}ms`);
            firstToken = false;
          }
          
          fullContent += delta;
          dispatch(updateMessage({
            chatId: activeChat,
            messageId: assistantMessageId,
            content: fullContent,
          }));
        }

        // Handle usage data if available
        if (chunk.usage) {
          const cost = estimateCost(model, chunk.usage.prompt_tokens || 0, chunk.usage.completion_tokens || 0);
          
          dispatch(updateMessage({
            chatId: activeChat,
            messageId: assistantMessageId,
            content: fullContent,
            tokens: chunk.usage.total_tokens,
            cost,
          }));

          costTracker.addCost({
            model,
            promptTokens: chunk.usage.prompt_tokens || 0,
            completionTokens: chunk.usage.completion_tokens || 0,
            cost,
            timestamp: Date.now(),
          });

          dispatch(incrementRequests());
          dispatch(addCost(cost));
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
    } finally {
      dispatch(setLoading(false));
      abortControllerRef.current = null;
    }
  }, [activeChat, apiKey, chats, model, temperature, maxTokens, enableCache, isLoading, dispatch]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    sendMessage,
    stopGeneration,
    isLoading,
  };
};

// Simple cost estimation - you'd want more accurate pricing
function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'llama-3.1-70b-instruct': { input: 0.0008, output: 0.0008 },
    'llama-3.3-70b-instruct': { input: 0.0008, output: 0.0008 },
    'mixtral-8x7b-instruct': { input: 0.0007, output: 0.0007 },
    // Add more models...
  };

  const rate = rates[model] || { input: 0.001, output: 0.001 };
  return (promptTokens * rate.input + completionTokens * rate.output) / 1000;
}