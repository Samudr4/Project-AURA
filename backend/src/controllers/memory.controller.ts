import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

export const createMemory = async (req: Request, res: Response) => {
  try {
    const { projectId, type, content, importanceScore, source } = req.body;

    if (!projectId || !type || !content) {
      return res.status(422).json({ success: false, error: 'projectId, type, and content are required' });
    }

    const memory = await prisma.memory.create({
      data: {
        projectId,
        type,
        content,
        importanceScore: importanceScore || 0.8,
        source: source || 'user-manual'
      }
    });

    res.status(201).json({ success: true, data: memory });
  } catch (error: any) {
    logger.error({ msg: 'Create memory failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const listMemories = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(422).json({ success: false, error: 'projectId is required' });
    }

    const memories = await prisma.memory.findMany({
      where: { projectId: projectId as string },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: memories });
  } catch (error: any) {
    logger.error({ msg: 'List memories failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const updateMemory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, importanceScore } = req.body;

    const memory = await prisma.memory.findUnique({
      where: { id }
    });

    if (!memory) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    const updated = await prisma.memory.update({
      where: { id },
      data: {
        content: content !== undefined ? content : memory.content,
        importanceScore: importanceScore !== undefined ? importanceScore : memory.importanceScore
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    logger.error({ msg: 'Update memory failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const deleteMemory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const memory = await prisma.memory.findUnique({
      where: { id }
    });

    if (!memory) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    await prisma.memory.delete({
      where: { id }
    });

    res.status(200).json({ success: true, data: { id } });
  } catch (error: any) {
    logger.error({ msg: 'Delete memory failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
