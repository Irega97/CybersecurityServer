import { Router } from 'express';
import rsaController from '../controllers/rsa.controller';


const router: Router = Router();

router.get('/msg', rsaController.getRSA);
router.post('/post', rsaController.postRSA);
router.get('/server/pubkey', rsaController.getPublicKeyRSA);
router.post('/client/pubkey', rsaController.postPubKeyRSA);

export default router;