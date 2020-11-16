import { Router } from 'express';
import rsaController from '../controllers/rsa.controller';


const router: Router = Router();

router.get('/msg', rsaController.getRSA);
router.post('/post', rsaController.postRSA);

export default router;