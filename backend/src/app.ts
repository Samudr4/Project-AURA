import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';

import projectRoutes from './routes/project.routes.js';
import chatRoutes from './routes/chat.routes.js';
import memoryRoutes from './routes/memory.routes.js';
import settingRoutes from './routes/setting.routes.js';
import documentRoutes from './routes/document.routes.js';
import agentRoutes from './routes/agent.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import researchRoutes from './routes/research.routes.js';
import automationRoutes from './routes/automation.routes.js';
import visionRoutes from './routes/vision.routes.js';
import voiceRoutes from './routes/voice.routes.js';
import computerRoutes from './routes/computer.routes.js';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/memory', memoryRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/research', researchRoutes);
app.use('/api/v1/automation', automationRoutes);
app.use('/api/v1/vision', visionRoutes);
app.use('/api/v1/voice', voiceRoutes);
app.use('/api/v1/computer', computerRoutes);

// Log active API keys configuration
const detectAPIKeys = () => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;

  logger.info({
    msg: "AURA API Router initialized",
    providers: {
      openai: hasOpenAI ? "CONFIGURED" : "MISSING",
      anthropic: hasAnthropic ? "CONFIGURED" : "MISSING",
      google: hasGoogle ? "CONFIGURED" : "MISSING"
    },
    autoSwitchingEnabled: true
  });
};

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'backend'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'backend-api'
  });
});

app.get('/api/v1/models', (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;

  const models = [];

  if (hasOpenAI) {
    models.push({ name: 'gpt-5', provider: 'openai' });
  }
  if (hasAnthropic) {
    models.push({ name: 'claude-opus', provider: 'anthropic' });
    models.push({ name: 'claude-sonnet', provider: 'anthropic' });
    models.push({ name: 'claude-haiku', provider: 'anthropic' });
  }
  if (hasGoogle) {
    models.push({ name: 'gemini-2', provider: 'google' });
    models.push({ name: 'gemini-3', provider: 'google' });
  }

  res.status(200).json({
    success: true,
    data: models
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  detectAPIKeys();
});
