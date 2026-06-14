import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

// Seed default user if not exists to simplify local API tests without complex auth
async function getOrCreateUserId(): Promise<string> {
  const defaultEmail = 'samudra@aura.ai';
  let user = await prisma.user.findUnique({
    where: { email: defaultEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Samudra',
        email: defaultEmail,
      }
    });
  }

  return user.id;
}

export const saveApiKey = async (req: Request, res: Response) => {
  try {
    const { provider, key } = req.body;

    if (!provider || key === undefined) {
      return res.status(422).json({ success: false, error: 'provider and key are required' });
    }

    const userId = await getOrCreateUserId();
    const providerLower = provider.toLowerCase();

    // Check if key already exists
    const existing = await prisma.apiKey.findFirst({
      where: { userId, provider: providerLower }
    });

    if (existing) {
      // Update key
      await prisma.apiKey.update({
        where: { id: existing.id },
        data: { encryptedKey: key }
      });
      logger.info(`Updated API Key for provider: ${providerLower}`);
    } else {
      // Create new key record
      await prisma.apiKey.create({
        data: {
          userId,
          provider: providerLower,
          encryptedKey: key
        }
      });
      logger.info(`Created new API Key for provider: ${providerLower}`);
    }

    res.status(200).json({ success: true, data: { provider: providerLower, status: !!key } });
  } catch (error: any) {
    logger.error({ msg: 'Save API key failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getApiKeysStatus = async (req: Request, res: Response) => {
  try {
    const userId = await getOrCreateUserId();

    const keys = await prisma.apiKey.findMany({
      where: { userId }
    });

    const status = {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      google: !!process.env.GOOGLE_API_KEY
    };

    // Override if database has configurations
    for (const record of keys) {
      if (record.provider === 'openai') status.openai = status.openai || !!record.encryptedKey;
      if (record.provider === 'anthropic') status.anthropic = status.anthropic || !!record.encryptedKey;
      if (record.provider === 'google') status.google = status.google || !!record.encryptedKey;
    }

    res.status(200).json({ success: true, data: status });
  } catch (error: any) {
    logger.error({ msg: 'Get API keys status failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getGeneralSettings = async (req: Request, res: Response) => {
  try {
    const userId = await getOrCreateUserId();

    let settings = await prisma.setting.findFirst({
      where: { userId }
    });

    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          userId,
          theme: 'dark',
          defaultModel: 'auto',
          persona: 'developer',
          preferences: {}
        }
      });
      logger.info(`Seeded default settings for user: ${userId}`);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    logger.error({ msg: 'Get general settings failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const saveGeneralSettings = async (req: Request, res: Response) => {
  try {
    const { theme, defaultModel, persona, preferences } = req.body;
    const userId = await getOrCreateUserId();

    const existing = await prisma.setting.findFirst({
      where: { userId }
    });

    let updated;
    if (existing) {
      updated = await prisma.setting.update({
        where: { id: existing.id },
        data: {
          theme: theme !== undefined ? theme : existing.theme,
          defaultModel: defaultModel !== undefined ? defaultModel : existing.defaultModel,
          persona: persona !== undefined ? persona : existing.persona,
          preferences: preferences !== undefined ? preferences : existing.preferences || {}
        }
      });
      logger.info(`Updated settings for user: ${userId}`);
    } else {
      updated = await prisma.setting.create({
        data: {
          userId,
          theme: theme || 'dark',
          defaultModel: defaultModel || 'auto',
          persona: persona || 'developer',
          preferences: preferences || {}
        }
      });
      logger.info(`Created settings for user: ${userId}`);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    logger.error({ msg: 'Save general settings failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
