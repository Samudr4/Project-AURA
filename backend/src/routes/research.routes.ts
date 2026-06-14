import { Router } from 'express';
import { conductResearch } from '../controllers/research.controller.js';

const router = Router();

router.post('/', conductResearch);

export default router;
