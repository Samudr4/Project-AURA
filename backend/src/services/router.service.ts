import { OpenAIProvider } from '../providers/openai.provider.js';
import { AnthropicProvider } from '../providers/anthropic.provider.js';
import { GoogleProvider } from '../providers/google.provider.js';
import { IModelProvider, MessagePayload } from '../providers/provider.interface.js';
import { prisma } from '../config/db.js';
import { Response } from 'express';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

export type TaskType = 'chat' | 'coding' | 'vision' | 'reasoning' | 'writing' | 'research';

export class ModelRouterService {
  private openai = new OpenAIProvider();
  private anthropic = new AnthropicProvider();
  private google = new GoogleProvider();

  // Detect which API keys are active (env vars or DB keys)
  private async getActiveProviders(): Promise<{ openai: boolean; anthropic: boolean; google: boolean }> {
    const active = {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      google: !!process.env.GOOGLE_API_KEY,
    };

    try {
      const keys = await prisma.apiKey.findMany();
      for (const record of keys) {
        if (record.provider === 'openai') active.openai = active.openai || !!record.encryptedKey;
        if (record.provider === 'anthropic') active.anthropic = active.anthropic || !!record.encryptedKey;
        if (record.provider === 'google') active.google = active.google || !!record.encryptedKey;
      }
    } catch {
      // Ignore database connection issues during early startup before migrations
    }

    return active;
  }

  // Map Task to Provider and specific Model based on active keys
  public async route(task: TaskType): Promise<{ provider: IModelProvider; model: string; providerName: string }> {
    const active = await this.getActiveProviders();
    const totalActive = Object.values(active).filter(Boolean).length;

    logger.info({ msg: "Routing request", task, activeProviders: active });

    // Fallback: If no API keys are provided at all, default to Google/Gemini mock for local testing
    if (totalActive === 0) {
      logger.warn("No API keys configured. Falling back to local mock (Google/Gemini 2).");
      return { provider: this.google, model: 'gemini-2', providerName: 'google' };
    }

    // Default Routing Matrix when all providers are active
    switch (task) {
      case 'coding':
        if (active.openai) return { provider: this.openai, model: 'gpt-5', providerName: 'openai' };
        if (active.google) return { provider: this.google, model: 'gemini-3', providerName: 'google' };
        return { provider: this.anthropic, model: 'claude-opus', providerName: 'anthropic' };

      case 'reasoning':
        if (active.anthropic) return { provider: this.anthropic, model: 'claude-opus', providerName: 'anthropic' };
        if (active.google) return { provider: this.google, model: 'gemini-3', providerName: 'google' };
        return { provider: this.openai, model: 'gpt-5', providerName: 'openai' };

      case 'writing':
        if (active.anthropic) return { provider: this.anthropic, model: 'claude-sonnet', providerName: 'anthropic' };
        if (active.openai) return { provider: this.openai, model: 'gpt-5', providerName: 'openai' };
        return { provider: this.google, model: 'gemini-2', providerName: 'google' };

      case 'research':
        if (active.anthropic) return { provider: this.anthropic, model: 'claude-sonnet', providerName: 'anthropic' };
        if (active.google) return { provider: this.google, model: 'gemini-2', providerName: 'google' };
        return { provider: this.openai, model: 'gpt-5', providerName: 'openai' };

      case 'vision':
        if (active.openai) return { provider: this.openai, model: 'gpt-5', providerName: 'openai' };
        if (active.google) return { provider: this.google, model: 'gemini-2', providerName: 'google' };
        return { provider: this.anthropic, model: 'claude-sonnet', providerName: 'anthropic' };

      case 'chat':
      default:
        // Everyday chat routes to Claude Sonnet, then Gemini 2, then GPT-5
        if (active.anthropic) return { provider: this.anthropic, model: 'claude-sonnet', providerName: 'anthropic' };
        if (active.google) return { provider: this.google, model: 'gemini-2', providerName: 'google' };
        return { provider: this.openai, model: 'gpt-5', providerName: 'openai' };
    }
  }

  // Execute non-streaming route
  public async executeTask(task: TaskType, messages: MessagePayload[]) {
    const { provider, model, providerName } = await this.route(task);
    logger.info(`Routing task "${task}" to provider "${providerName}" using model "${model}"`);
    return provider.generateResponse(model, messages);
  }

  // Execute streaming route
  public async executeStreamTask(task: TaskType, messages: MessagePayload[], res: Response) {
    const { provider, model, providerName } = await this.route(task);
    logger.info(`Streaming task "${task}" to provider "${providerName}" using model "${model}"`);
    return provider.generateStreamResponse(model, messages, res);
  }
}
