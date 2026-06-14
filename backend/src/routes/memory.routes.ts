import { Router } from 'express';
import { createMemory, listMemories, updateMemory, deleteMemory } from '../controllers/memory.controller.js';

const router = Router();

router.post('/', createMemory);
router.get('/', listMemories);
router.patch('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;
