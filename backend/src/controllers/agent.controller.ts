import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import pino from 'pino';

const logger = pino({
  transport: { target: 'pino-pretty' }
});

const DEFAULT_AGENTS = [
  {
    name: 'Research Agent',
    type: 'research',
    description: 'Performs deep web-crawled search, comparative analysis, and compiles structured markdown literature reports.'
  },
  {
    name: 'Coding Agent',
    type: 'coding',
    description: 'Examines codebase workspaces, structures refactoring blueprints, and generates context-aware unit tests.'
  },
  {
    name: 'Writing Agent',
    type: 'writing',
    description: 'Crafts premium articles, brainstorms marketing outlines, and designs clean executive summaries.'
  },
  {
    name: 'Startup Agent',
    type: 'startup',
    description: 'Generates financial spreadsheets, business model canvas mappings, and pitches investors on product outlines.'
  }
];

export const getAgents = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(422).json({ success: false, error: 'projectId is required' });
    }

    let agents = await prisma.agent.findMany({
      where: { projectId: projectId as string },
      orderBy: { createdAt: 'asc' }
    });

    // Seed default agents if none exist
    if (agents.length === 0) {
      logger.info(`Seeding default agents for project: ${projectId}`);
      for (const item of DEFAULT_AGENTS) {
        await prisma.agent.create({
          data: {
            projectId: projectId as string,
            name: item.name,
            type: item.type,
            description: item.description,
            enabled: true
          }
        });
      }
      // Re-fetch
      agents = await prisma.agent.findMany({
        where: { projectId: projectId as string },
        orderBy: { createdAt: 'asc' }
      });
    }

    res.status(200).json({ success: true, data: agents });
  } catch (error: any) {
    logger.error({ msg: 'Get agents failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const toggleAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
      return res.status(422).json({ success: false, error: 'enabled state is required' });
    }

    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const updated = await prisma.agent.update({
      where: { id },
      data: { enabled }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    logger.error({ msg: 'Toggle agent failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(422).json({ success: false, error: 'projectId is required' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: projectId as string },
      orderBy: { createdAt: 'desc' },
      include: { agent: true }
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    logger.error({ msg: 'Get tasks failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// Simulated asynchronous task solver
const simulateTaskExecution = async (taskId: string, type: string, input: string) => {
  try {
    // Wait for 3.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 3500));

    let output = '';
    const cleanInput = input || 'General task prompt';

    if (type === 'research') {
      output = `## 🔍 AURA Deep Research Report
**Subject Query:** *"${cleanInput}"*
**Analysis Timestamp:** ${new Date().toLocaleString()}

### 1. Executive Summary
This report analyzes the targeted search parameters regarding *"${cleanInput}"*. Standard crawled models indicate high-interest growth metrics with notable deployment velocity.

### 2. Comparative Matrix Table
| Aspect | Phase 1 Standard | Target Solution | Improvement |
| :--- | :--- | :--- | :--- |
| Latency | 280ms | 45ms | +84% |
| Recall | 88.5% | 96.2% | +8.7% |
| Ingestion Cost | $0.12/k | $0.02/k | -83.3% |

### 3. Key Findings
* **Aura-Crawled Vectors:** High semantic similarities mapped in active spaces.
* **Architecture Impact:** Localized memory routing drastically reduces agent handshakes.
* **Risk analysis:** Rate limit thresholds should monitor large base64 pipelines.

### 4. Sources Cited
1. *AURA Research Lab Logs, Vol. 2 (2026).*
2. *RAG & Semantic Storage optimization metrics, Samudra (2026).*`;
    } else if (type === 'coding') {
      output = `## 💻 Coding Workspace Solution
**Request:** *"${cleanInput}"*
**Platform:** Next.js / Node.js Engine

### 1. Code Implementation Block
Here is the generated optimization component:

\`\`\`typescript
// src/components/OptimizedController.ts
import { EventEmitter } from 'events';

export class IngestionController extends EventEmitter {
  private queue: string[] = [];
  
  constructor(private batchSize: number = 10) {
    super();
  }

  public enqueue(chunk: string): void {
    this.queue.push(chunk);
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  private flush(): void {
    const batch = [...this.queue];
    this.queue = [];
    this.emit('batch', batch);
  }
}
\`\`\`

### 2. Integration Guidelines
1. Import into your handler file.
2. Initialize with batch constraints.
3. Attach listener callbacks for async executions.`;
    } else if (type === 'writing') {
      output = `## ✍️ Writing Suite Generation
**Prompt:** *"${cleanInput}"*
**Tone Profile:** Professional Premium

### 1. Main Draft
The architecture of Project AURA represents a paradigm shift in how users own, shape, and command their personal intelligence platforms. By placing data ownership back inside a localized container and pairing it with a dynamic routing grid, AURA ensures prompt execution remains both cost-effective and highly optimized.

### 2. Value Canvas
* **Simplicity:** One dashboard, unlimited scoped integration.
* **Autonomy:** Auto-switches between provider nodes seamlessly.
* **Intelligence:** Persistent long-term facts remain accessible across threads.

### 3. Alternative Headlines
* *Aura: The Decentralized AI Orchestrator for Advanced Power Users*
* *Local Memory, Global Intelligence: Inside Project AURA*`;
    } else {
      output = `## 📊 Startup Strategy Canvas
**Task Prompt:** *"${cleanInput}"*

### 1. Lean Canvas Blueprint
* **Problem:** Centralized AI services control and lock user data in walled silos.
* **Solution:** A self-contained AI Operating System with localized database scoping.
* **Key Metrics:** High-speed token indexing and low routing costs.
* **Unfair Advantage:** Unified routing logic with zero API key leaks.

### 2. Financial Metrics Estimator
* **Server Overhead:** $5.00/month (standard container).
* **AI Ingestion Token Run-rate:** $0.05 per 1M inputs.
* **Break-even Timeline:** Month 2 post deployment.`;
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        result: { output },
        completedAt: new Date()
      }
    });

    logger.info(`Simulated task ${taskId} completed successfully`);
  } catch (err: any) {
    logger.error(`Simulated task ${taskId} failed: ${err.message}`);
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'failed',
        result: { error: err.message },
        completedAt: new Date()
      }
    }).catch(() => {});
  }
};

export const runAgentTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // agentId
    const { projectId, inputPayload } = req.body;

    if (!projectId || !inputPayload) {
      return res.status(422).json({ success: false, error: 'projectId and inputPayload are required' });
    }

    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    if (!agent.enabled) {
      return res.status(400).json({ success: false, error: 'This agent is currently disabled' });
    }

    // Create running task record
    const task = await prisma.task.create({
      data: {
        projectId,
        agentId: id,
        status: 'running',
        type: agent.type,
        payload: { input: inputPayload }
      }
    });

    // Kick off async simulation in the background
    simulateTaskExecution(task.id, agent.type, inputPayload);

    res.status(202).json({ success: true, data: task });
  } catch (error: any) {
    logger.error({ msg: 'Run agent task failed', error: error.message });
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
