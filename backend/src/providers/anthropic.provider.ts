import { Response } from 'express';
import { IModelProvider, MessagePayload, ProviderResponse } from './provider.interface.js';
import { prisma } from '../config/db.js';

export class AnthropicProvider implements IModelProvider {
  private async getApiKey(): Promise<string | null> {
    if (process.env.ANTHROPIC_API_KEY) {
      return process.env.ANTHROPIC_API_KEY;
    }
    try {
      const record = await prisma.apiKey.findFirst({
        where: { provider: 'anthropic' }
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
      throw new Error("Anthropic API Key not configured. Please add it in settings.");
    }

    const anthropicModel = model === 'claude-opus' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022';

    // Anthropic separates system instructions from messages list
    const systemMessage = messages.find(m => m.role === 'system');
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content || ''
      }));

    // If contents array is empty, add a dummy user prompt
    if (contents.length === 0) {
      contents.push({ role: 'user' as const, content: 'Hello' });
    }

    const payload: any = {
      model: anthropicModel,
      messages: contents,
      max_tokens: options?.maxTokens || 2048,
    };

    if (systemMessage) {
      payload.system = systemMessage.content;
    }
    if (options?.temperature !== undefined) {
      payload.temperature = options.temperature;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Anthropic API error: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || '';
    const usage = {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0
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
