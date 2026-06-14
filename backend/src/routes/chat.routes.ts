import { Router } from 'express';
import { startChat, listChats, getChatHistory, sendStreamMessage } from '../controllers/chat.controller.js';

const router = Router();

router.post('/', startChat);
router.get('/', listChats);
router.get('/:chatId/history', getChatHistory);
router.post('/stream', sendStreamMessage);

export default router;
