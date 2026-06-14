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

const SEED_CALLS = [
  // GPT-5 (Higher cost, low latency)
  { model: 'gpt-5', tokensInput: 45000, tokensOutput: 12000, cost: 0.855, latencyMs: 1450 },
  { model: 'gpt-5', tokensInput: 25000, tokensOutput: 8000, cost: 0.495, latencyMs: 1300 },
  { model: 'gpt-5', tokensInput: 85000, tokensOutput: 24000, cost: 1.635, latencyMs: 1800 },
  
  // Claude Sonnet (Medium cost, medium latency)
  { model: 'claude-sonnet', tokensInput: 15000, tokensOutput: 5000, cost: 0.120, latencyMs: 1100 },
  { model: 'claude-sonnet', tokensInput: 32000, tokensOutput: 9000, cost: 0.231, latencyMs: 1250 },
  { model: 'claude-sonnet', tokensInput: 8000, tokensOutput: 3000, cost: 0.069, latencyMs: 950 },
  { model: 'claude-sonnet', tokensInput: 45000, tokensOutput: 15000, cost: 0.360, latencyMs: 1400 },
  
  // Gemini 2 (Low cost, super low latency)
  { model: 'gemini-2', tokensInput: 12000, tokensOutput: 4000, cost: 0.012, latencyMs: 580 },
  { model: 'gemini-2', tokensInput: 52000, tokensOutput: 18000, cost: 0.053, latencyMs: 720 },
  { model: 'gemini-2', tokensInput: 98000, tokensOutput: 35000, cost: 0.101, latencyMs: 890 },
  { model: 'gemini-2', tokensInput: 15000, tokensOutput: 6000, cost: 0.016, latencyMs: 550 },
  { model: 'gemini-2', tokensInput: 4000, tokensOutput: 2000, cost: 0.005, latencyMs: 420 },

  // Claude Opus (High cost, high latency)
  { model: 'claude-opus', tokensInput: 10000, tokensOutput: 3000, cost: 0.240, latencyMs: 2600 },
  { model: 'claude-opus', tokensInput: 25000, tokensOutput: 7000, cost: 0.585, latencyMs: 2900 }
];

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const userId = await getOrCreateUserId();

    let logs = await prisma.analytics.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Seed mock entries if table is empty
    if (logs.length === 0) {
      logger.info(`Seeding default analytics logs for user: ${userId}`);
      for (const item of SEED_CALLS) {
        await prisma.analytics.create({
          data: {
            userId,
            model: item.model,
            tokensInput: item.tokensInput,
            tokensOutput: item.tokensOutput,
            cost: item.cost,
            latencyMs: item.latencyMs
          }
        });
      }
      // Re-fetch
      logs = await prisma.analytics.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Calculations
    const totalCost = logs.reduce((sum, item) => sum + item.cost, 0);
    const totalTokens = logs.reduce((sum, item) => sum + item.tokensInput + item.tokensOutput, 0);
    const averageLatency = logs.length > 0
      ? Math.round(logs.reduce((sum, item) => sum + item.latencyMs, 0) / logs.length)
      : 0;

    // Grouping by model
    const groups: Record<string, {
      model: string;
      provider: string;
      callsCount: number;
      totalTokens: number;
      totalCost: number;
      latencySum: number;
    }> = {};

    const modelToProvider = (m: string) => {
      if (m.startsWith('gpt')) return 'openai';
      if (m.startsWith('claude')) return 'anthropic';
      return 'google';
    };

    logs.forEach(item => {
      const m = item.model;
      if (!groups[m]) {
        groups[m] = {
          model: m,
          provider: modelToProvider(m),
          callsCount: 0,
          totalTokens: 0,
          totalCost: 0,
          latencySum: 0
        };
      }
      groups[m].callsCount += 1;
      groups[m].totalTokens += (item.tokensInput + item.tokensOutput);
      groups[m].totalCost += item.cost;
      groups[m].latencySum += item.latencyMs;
    });

    const modelBreakdown = Object.values(groups).map(g => ({
      model: g.model,
      provider: g.provider,
      callsCount: g.callsCount,
      totalTokens: g.totalTokens,
      totalCost: parseFloat(g.totalCost.toFixed(5)),
      averageLatency: Math.round(g.latencySum / g.callsCount)
    }));

    res.status(200).json({
      success: true,
      data: {
        totalCost: parseFloat(totalCost.toFixed(4)),
        totalTokens,
        averageLatency,
        totalCalls: logs.length,
        modelBreakdown,
        recentCalls: logs.slice(0, 5)
      }
    });
  } catch (error: any) {
    logger.error({ msg: 'Get analytics summary failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
