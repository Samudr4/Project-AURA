import { Response } from 'express';
import { IModelProvider, MessagePayload, ProviderResponse } from './provider.interface.js';
import { prisma } from '../config/db.js';

export class GoogleProvider implements IModelProvider {
  private async getApiKey(): Promise<string | null> {
    if (process.env.GOOGLE_API_KEY) {
      return process.env.GOOGLE_API_KEY;
    }
    try {
      const record = await prisma.apiKey.findFirst({
        where: { provider: 'google' }
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
      throw new Error("Google API Key not configured. Please add it in settings.");
    }

    const geminiModel = model === 'gemini-2'
      ? 'gemini-1.5-flash'
      : model === 'gemini-3'
        ? 'gemini-1.5-pro'
        : model;

    // Filter system message for systemInstruction parameter
    const systemMessage = messages.find(m => m.role === 'system');
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }));

    // If contents array is empty (e.g. only system message present), add a dummy user prompt
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const payload: any = { contents };

    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage.content || '' }]
      };
    }

    payload.generationConfig = {};
    if (options?.temperature !== undefined) {
      payload.generationConfig.temperature = options.temperature;
    }
    if (options?.maxTokens !== undefined) {
      payload.generationConfig.maxOutputTokens = options.maxTokens;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = {
      promptTokens: data.usageMetadata?.promptTokenCount || messages.length * 10,
      completionTokens: data.usageMetadata?.candidatesTokenCount || content.split(' ').length
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
      
      // Split output into words/spaces and stream with delays to simulate token streaming
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
