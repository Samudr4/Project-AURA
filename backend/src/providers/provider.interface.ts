import { Response } from 'express';

export interface MessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface IModelProvider {
  generateResponse(
    model: string,
    messages: MessagePayload[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<ProviderResponse>;

  generateStreamResponse(
    model: string,
    messages: MessagePayload[],
    res: Response,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<void>;
}
