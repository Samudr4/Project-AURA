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
    logger.info(`Seeded default user: ${user.id}`);
  }

  return user.id;
}

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(422).json({ success: false, error: 'Name is required' });
    }

    const userId = await getOrCreateUserId();

    const project = await prisma.project.create({
      data: {
        userId,
        name,
        description,
        icon,
        color
      }
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    logger.error({ msg: 'Create project failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const listProjects = async (req: Request, res: Response) => {
  try {
    const userId = await getOrCreateUserId();

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    logger.error({ msg: 'List projects failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    logger.error({ msg: 'Get project failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.status(200).json({ success: true, data: { id } });
  } catch (error: any) {
    logger.error({ msg: 'Delete project failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
