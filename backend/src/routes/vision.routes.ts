import { Router } from 'express';
import { analyzeImage } from '../controllers/vision.controller.js';

const router = Router();

router.post('/analyze', analyzeImage);

export default router;
