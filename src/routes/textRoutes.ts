import { Router } from 'express';
import textController from '../controllers/text.controller';

const router: Router = Router();

router.get('/msg', textController.getText);
router.post('/post', textController.postText);

export default router;