import { Router } from 'express';
import { getAgents, toggleAgent, getTasks, runAgentTask } from '../controllers/agent.controller.js';

const router = Router();

router.get('/', getAgents);
router.patch('/:id/toggle', toggleAgent);
router.get('/tasks', getTasks);
router.post('/:id/run', runAgentTask);

export default router;
