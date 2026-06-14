import { Router } from 'express';
import { createProject, listProjects, getProject, deleteProject } from '../controllers/project.controller.js';

const router = Router();

router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);

export default router;
