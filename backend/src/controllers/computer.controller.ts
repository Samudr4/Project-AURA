import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

interface ExecutionStep {
  stepIndex: number;
  action: string;
  target: string;
  status: 'success' | 'failed' | 'awaiting_approval';
  details: string;
  x?: number; // Simulated cursor move X (0-100)
  y?: number; // Simulated cursor move Y (0-100)
}

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

export const triggerComputerAction = async (req: Request, res: Response) => {
  try {
    const { projectId, actionPrompt, safetyLevel, allowUnrestrictedShell } = req.body;

    if (!projectId || !actionPrompt) {
      return res.status(422).json({ success: false, error: 'projectId and actionPrompt are required' });
    }

    const userId = await getOrCreateUserId();
    const cleanPrompt = actionPrompt.trim();
    const activeSafety = safetyLevel !== undefined ? Number(safetyLevel) : 1;

    logger.info(`Triggering computer automation for user ${userId} in project ${projectId}: "${cleanPrompt}" (Safety Level: ${activeSafety})`);

    // Standard simulated execution plan
    const steps: ExecutionStep[] = [
      { stepIndex: 1, action: 'open_app', target: 'Chrome Browser', status: 'success', details: 'Initialized Google Chrome sandboxed session.', x: 10, y: 15 },
      { stepIndex: 2, action: 'navigate', target: 'http://localhost:3000', status: 'success', details: 'Navigated browser viewport to workspace URL.', x: 45, y: 40 },
      { stepIndex: 3, action: 'wait_load', target: 'DOM ready', status: 'success', details: 'Verified DOM layout structures matching page viewport.', x: 45, y: 40 }
    ];

    const normalizedPrompt = cleanPrompt.toLowerCase();
    let finalStatus: string = 'completed';

    // Formulate steps based on action intent
    if (normalizedPrompt.includes('delete') || normalizedPrompt.includes('remove') || normalizedPrompt.includes('purge')) {
      steps.push({
        stepIndex: 4,
        action: 'filesystem_scan',
        target: 'temp/build_cache',
        status: 'success',
        details: 'Scanned 14 files inside temporary workspace folders.',
        x: 60,
        y: 50
      });

      // High safety trigger for deletion
      if (activeSafety >= 3) {
        steps.push({
          stepIndex: 5,
          action: 'delete_file',
          target: 'temp/build_cache/manifest.json',
          status: 'awaiting_approval',
          details: 'Action requires explicit human validation prior to filesystem write/delete operations.',
          x: 20,
          y: 75
        });
        finalStatus = 'paused';
      } else {
        steps.push({
          stepIndex: 5,
          action: 'delete_file',
          target: 'temp/build_cache/manifest.json',
          status: 'success',
          details: 'Purged temporary manifest file logs cleanly.',
          x: 20,
          y: 75
        });
      }
    } else if (normalizedPrompt.includes('code') || normalizedPrompt.includes('vs code') || normalizedPrompt.includes('compile')) {
      steps.push(
        { stepIndex: 4, action: 'open_app', target: 'VS Code Editor', status: 'success', details: 'Focused active editor process.', x: 85, y: 20 },
        { stepIndex: 5, action: 'press_shortcut', target: 'Ctrl+Shift+B', status: 'success', details: 'Triggered typescript project build task compile loops.', x: 85, y: 25 },
        { stepIndex: 6, action: 'validate_ocr', target: 'Terminal Output', status: 'success', details: 'Read logs stream: "Compiled successfully in 2.3s".', x: 75, y: 80 }
      );
    } else if (normalizedPrompt.includes('publish') || normalizedPrompt.includes('email') || normalizedPrompt.includes('send')) {
      steps.push({
        stepIndex: 4,
        action: 'network_request',
        target: 'SMTP Relay Server',
        status: 'success',
        details: 'Drafted HTML digest content outline inside transmission buffers.',
        x: 35,
        y: 60
      });

      // High safety trigger for network publishing
      if (activeSafety >= 2) {
        steps.push({
          stepIndex: 5,
          action: 'smtp_transmit',
          target: 'SMTP Relay Server',
          status: 'awaiting_approval',
          details: 'Action requires explicit human validation prior to external transmission/smtp relays.',
          x: 80,
          y: 35
        });
        finalStatus = 'paused';
      } else {
        steps.push({
          stepIndex: 5,
          action: 'smtp_transmit',
          target: 'SMTP Relay Server',
          status: 'success',
          details: 'Transmitted digest mail log to local relay successfully.',
          x: 80,
          y: 35
        });
      }
    } else {
      // Default browser navigation crawl
      steps.push(
        { stepIndex: 4, action: 'click_element', target: 'Search Field', status: 'success', details: 'Focused website search field input box.', x: 50, y: 30 },
        { stepIndex: 5, action: 'type_text', target: 'Next.js 15 Latency', status: 'success', details: 'Typed search metrics prompt.', x: 50, y: 30 },
        { stepIndex: 6, action: 'click_element', target: 'Submit Button', status: 'success', details: 'Submitted search query.', x: 70, y: 30 }
      );
    }

    // Log the computer automation run to postgres logs for observability/security auditing
    await prisma.log.create({
      data: {
        userId,
        action: 'computer_action',
        metadata: {
          projectId,
          prompt: cleanPrompt,
          safetyLevel: activeSafety,
          allowUnrestrictedShell: !!allowUnrestrictedShell,
          status: finalStatus,
          steps
        } as any
      }
    });

    res.status(200).json({
      success: true,
      data: {
        status: finalStatus,
        steps,
        metrics: {
          successRate: finalStatus === 'failed' ? 0.0 : 100.0,
          durationSec: Math.floor(steps.length * 1.5 + 2),
          retries: 0,
          screenshotsCount: steps.filter(s => s.action !== 'wait_load').length
        }
      }
    });
  } catch (error: any) {
    logger.error({ msg: 'Computer action trigger failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const listComputerSessions = async (req: Request, res: Response) => {
  try {
    const userId = await getOrCreateUserId();

    // Query database for computer action runs
    const logs = await prisma.log.findMany({
      where: {
        userId,
        action: 'computer_action'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Seed historical sessions if database history is empty
    const mockSessions = [
      {
        id: "c-session-802",
        prompt: "Verify local git repo branch diffs",
        status: "completed",
        successRate: 100.0,
        durationSec: 12,
        retries: 0,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      },
      {
        id: "c-session-801",
        prompt: "Purge temp log files inside build_cache",
        status: "paused",
        successRate: 80.0,
        durationSec: 8,
        retries: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: "c-session-800",
        prompt: "Crawl OpenAI release notes page",
        status: "completed",
        successRate: 100.0,
        durationSec: 15,
        retries: 0,
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];

    let resultSessions = [...mockSessions];
    if (logs.length > 0) {
      const dbSessions = logs.map((log: any, idx: number) => {
        const meta = log.metadata as any;
        return {
          id: `c-session-db-${idx}`,
          prompt: meta?.prompt || "Automated task",
          status: meta?.status || "completed",
          successRate: meta?.status === 'failed' ? 0.0 : 100.0,
          durationSec: meta?.steps?.length ? Math.floor(meta.steps.length * 1.5 + 2) : 10,
          retries: 0,
          createdAt: log.createdAt.toISOString()
        };
      });
      resultSessions = [...dbSessions, ...mockSessions];
    }

    res.status(200).json({
      success: true,
      data: resultSessions
    });
  } catch (error: any) {
    logger.error({ msg: 'List computer sessions failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
