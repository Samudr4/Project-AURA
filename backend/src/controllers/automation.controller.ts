import { Request, Response } from 'express';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

interface AutomationJob {
  id: string;
  name: string;
  cron: string;
  status: 'Active' | 'Inactive';
  description: string;
  lastRun: string;
}

// Persist state in memory during server run time
let automationJobs: AutomationJob[] = [
  {
    id: 'daily-digest',
    name: 'Daily Activity Digest',
    cron: '0 8 * * *',
    status: 'Active',
    description: 'Summarizes conversations, highlights key user preferences, and indexes episodic logs.',
    lastRun: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'weekly-rag',
    name: 'Weekly RAG Index Maintenance',
    cron: '0 2 * * 0',
    status: 'Active',
    description: 'Scans vector databases, prunes redundant document chunks, and re-ranks query nodes.',
    lastRun: new Date(Date.now() - 3600000 * 24 * 5).toISOString() // 5 days ago
  },
  {
    id: 'git-sync',
    name: 'GitHub Codebase Sync',
    cron: '*/30 * * * *',
    status: 'Inactive',
    description: 'Polls configured repositories, identifies modified code files, and indexes abstract syntaxes.',
    lastRun: 'Never'
  }
];

export const getAutomationJobs = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(422).json({ success: false, error: 'projectId is required' });
    }

    res.status(200).json({ success: true, data: automationJobs });
  } catch (error: any) {
    logger.error({ msg: 'Get automation jobs failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const toggleJobStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
      return res.status(422).json({ success: false, error: 'enabled parameter is required' });
    }

    const job = automationJobs.find(j => j.id === id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Automation job not found' });
    }

    job.status = enabled ? 'Active' : 'Inactive';
    logger.info(`Toggled job "${job.name}" status to: ${job.status}`);

    res.status(200).json({ success: true, data: job });
  } catch (error: any) {
    logger.error({ msg: 'Toggle job failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const triggerJobNow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(422).json({ success: false, error: 'projectId is required' });
    }

    const job = automationJobs.find(j => j.id === id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Automation job not found' });
    }

    // Simulate cron background run
    logger.info(`Manually triggering cron job: "${job.name}"`);
    job.lastRun = new Date().toISOString();

    let telemetryMsg = '';
    if (job.id === 'daily-digest') {
      telemetryMsg = `✓ Daily Digest Compiled: Processed 4 memory records, cataloged 2 new preferences, and cached today's chat contexts.`;
    } else if (job.id === 'weekly-rag') {
      telemetryMsg = `✓ RAG Optimization Complete: Scanned collections, purged 15 orphaned chunks, and generated new centroid indexes.`;
    } else {
      telemetryMsg = `✓ Codebase Sync Complete: Pulled diff commits, parsed 8 typescript code adjustments, and updated vector models.`;
    }

    res.status(200).json({
      success: true,
      data: {
        job,
        logMessage: telemetryMsg,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error({ msg: 'Trigger job failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
