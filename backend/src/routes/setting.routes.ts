import { Router } from 'express';
import { saveApiKey, getApiKeysStatus, getGeneralSettings, saveGeneralSettings } from '../controllers/setting.controller.js';

const router = Router();

router.post('/keys', saveApiKey);
router.get('/keys', getApiKeysStatus);
router.get('/', getGeneralSettings);
router.post('/', saveGeneralSettings);

export default router;
