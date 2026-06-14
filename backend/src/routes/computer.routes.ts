import { Router } from 'express';
import { triggerComputerAction, listComputerSessions } from '../controllers/computer.controller.js';

const router = Router();

router.post('/action', triggerComputerAction);
router.get('/sessions', listComputerSessions);

export default router;
