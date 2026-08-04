import { Router } from 'express';
import { postChat, resetChat } from '../controllers/chatController.js';

const router = Router();

router.post('/', postChat);
router.post('/reset', resetChat);

export default router;
