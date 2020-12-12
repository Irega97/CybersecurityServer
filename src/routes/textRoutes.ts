import { Router } from 'express';
import textController from '../controllers/text.controller';
import rsaController from '../controllers/rsa.controller';

const router: Router = Router();

router.get('/msg', textController.getText);
router.post('/post', textController.postText);

export default router;