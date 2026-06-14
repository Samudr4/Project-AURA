import { Router } from 'express';
import { processVoiceInteraction, listVoiceSessions } from '../controllers/voice.controller.js';

const router = Router();

router.post('/interact', processVoiceInteraction);
router.get('/sessions', listVoiceSessions);

export default router;
