import { Response } from 'express';
import { IModelProvider, MessagePayload, ProviderResponse } from './provider.interface.js';
import { prisma } from '../config/db.js';

export class OpenAIProvider implements IModelProvider {
  private async getApiKey(): Promise<string | null> {
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
    try {
      const record = await prisma.apiKey.findFirst({
        where: { provider: 'openai' }
      });
      return record?.encryptedKey || null;
    } catch {
      return null;
    }
  }

  async generateResponse(
    model: string,
    messages: MessagePayload[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<ProviderResponse> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error("OpenAI API Key not configured. Please add it in settings.");
    }

    const openAIModel = model === 'gpt-5' ? 'gpt-4o' : model;

    const payload: any = {
      model: openAIModel,
      messages: messages.map(m => ({ role: m.role, content: m.content || '' })),
    };

    if (options?.temperature !== undefined) payload.temperature = options.temperature;
    if (options?.maxTokens !== undefined) payload.max_tokens = options.maxTokens;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API error: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = {
      promptTokens: data.usage?.prompt_tokens || messages.length * 15,
      completionTokens: data.usage?.completion_tokens || content.split(' ').length
    };

    return { content, usage };
  }

  async generateStreamResponse(
    model: string,
    messages: MessagePayload[],
    res: Response,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<void> {
    try {
      const result = await this.generateResponse(model, messages, options);
      const text = result.content;
      const chunks = text.split(/(\s+)/);
      for (const chunk of chunks) {
        if (chunk) {
          const payload = { type: 'token', content: chunk };
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: 'error', content: err.message })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    }
  }
}
