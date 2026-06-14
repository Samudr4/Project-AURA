import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { ModelRouterService, TaskType } from '../services/router.service.js';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

const routerService = new ModelRouterService();

// Extract memory facts automatically if matched
const extractMemoryIfFound = async (projectId: string, text: string) => {
  try {
    const textLower = text.toLowerCase();
    let preference: string | null = null;

    if (textLower.includes('i prefer')) {
      preference = text.substring(textLower.indexOf('i prefer'));
    } else if (textLower.includes('my stack is')) {
      preference = text.substring(textLower.indexOf('my stack is'));
    } else if (textLower.includes('i like')) {
      preference = text.substring(textLower.indexOf('i like'));
    }

    if (preference) {
      const memory = await prisma.memory.create({
        data: {
          projectId,
          type: 'preference',
          content: preference.trim(),
          importanceScore: 0.8,
          source: 'chat-extraction'
        }
      });
      logger.info(`Extracted long-term memory: "${memory.content}"`);
    }
  } catch (err: any) {
    logger.error(`Memory extraction failed: ${err.message}`);
  }
};

export const startChat = async (req: Request, res: Response) => {
  try {
    const { projectId, title } = req.body;

    if (!projectId || !title) {
      return res.status(422).json({ success: false, error: 'projectId and title are required' });
    }

    const chat = await prisma.chat.create({
      data: {
        projectId,
        title,
      }
    });

    res.status(201).json({ success: true, data: chat });
  } catch (error: any) {
    logger.error({ msg: 'Start chat failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const listChats = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(422).json({ success: false, error: 'projectId is required' });
    }

    const chats = await prisma.chat.findMany({
      where: { projectId: projectId as string },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: chats });
  } catch (error: any) {
    logger.error({ msg: 'List chats failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    logger.error({ msg: 'Get chat history failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const sendStreamMessage = async (req: Request, res: Response) => {
  try {
    const { projectId, chatId, message, task } = req.body;

    if (!projectId || !chatId || !message) {
      return res.status(422).json({ success: false, error: 'projectId, chatId, and message are required' });
    }

    // Save user's message
    await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content: message
      }
    });

    // Run async memory extraction
    extractMemoryIfFound(projectId, message);

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Detect task type based on message intent if not explicitly passed
    let taskType: TaskType = 'chat';
    if (task) {
      taskType = task as TaskType;
    } else {
      const msgLower = message.toLowerCase();
      if (msgLower.includes('code') || msgLower.includes('refactor') || msgLower.includes('typescript')) {
        taskType = 'coding';
      } else if (msgLower.includes('analyze') || msgLower.includes('screenshot') || msgLower.includes('ocr')) {
        taskType = 'vision';
      } else if (msgLower.includes('write') || msgLower.includes('draft')) {
        taskType = 'writing';
      } else if (msgLower.includes('research') || msgLower.includes('search')) {
        taskType = 'research';
      } else if (msgLower.includes('explain') || msgLower.includes('solve')) {
        taskType = 'reasoning';
      }
    }

    // Load full message history for context
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    const messagesPayload = history.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content
    }));

    // Perform streaming execution
    let streamText = '';
    const originalResWrite = res.write.bind(res);

    // Intercept stream writes to capture final text for database persistence
    res.write = (chunk: any, encoding?: any, cb?: any) => {
      try {
        const str = chunk.toString();
        if (str.startsWith('data: ')) {
          const lines = str.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr && dataStr !== '[DONE]') {
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.type === 'token') {
                    streamText += parsed.content;
                  }
                } catch {
                  // ignore parse issues for system tags
                }
              }
            }
          }
        }
      } catch (err) {
        // ignore errors
      }
      return originalResWrite(chunk, encoding, cb);
    };

    const routed = await routerService.route(taskType);
    
    // Broadcast metadata before stream begins
    res.write(`data: ${JSON.stringify({ type: 'info', model: routed.model, provider: routed.providerName })}\n\n`);

    await routed.provider.generateStreamResponse(routed.model, messagesPayload, res);

    // Save final assistant message to DB
    await prisma.message.create({
      data: {
        chatId,
        role: 'assistant',
        content: streamText.trim(),
        model: routed.model
      }
    });

    res.end();
  } catch (error: any) {
    logger.error({ msg: 'Streaming message failed', error: error.message });
    res.status(500).write(`data: ${JSON.stringify({ type: 'error', message: 'Internal Server Error' })}\n\n`);
    res.end();
  }
};
