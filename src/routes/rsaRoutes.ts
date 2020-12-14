import { Router } from 'express';
import rsaController from '../controllers/rsa.controller';


const router: Router = Router();

// MENSAJES
router.get('/msg', rsaController.getRSA);
router.post('/post', rsaController.postRSA);

// INTERCAMBIO DE CLAVES
router.get('/server/pubkey', rsaController.getPublicKeyRSA);
router.post('/client/pubkey', rsaController.postPubKeyRSA);

// FIRMA CIEGA
router.post('/sign', rsaController.blindSignature);

export default router;