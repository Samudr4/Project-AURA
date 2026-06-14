import { Router } from 'express';
import { getAutomationJobs, toggleJobStatus, triggerJobNow } from '../controllers/automation.controller.js';

const router = Router();

router.get('/', getAutomationJobs);
router.patch('/:id/toggle', toggleJobStatus);
router.post('/:id/trigger', triggerJobNow);

export default router;
