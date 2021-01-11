import { Router } from 'express';
import rsaController from '../controllers/rsa.controller';


const router: Router = Router();

// INTERCAMBIO DE CLAVES
router.get('/server/pubkey', rsaController.getPublicKeyRSA);
router.post('/client/pubkey', rsaController.postPubKeyRSA);

// RSA SERVICE
router.get('/msg', rsaController.getRSA);
router.post('/post', rsaController.postRSA);
router.post('/sign', rsaController.sign);

// NO REPUDIO
router.post('/nonrep', rsaController.noRepudio);
router.post('/ttp', rsaController.noRepTTP);

// HOMOMORFISMO
router.get('/paillier', rsaController.getPaillierPubKey);
router.post('/paillier', rsaController.postHomomorfismo);

export default router;