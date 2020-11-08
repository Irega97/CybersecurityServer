import { Router } from 'express';
import textRoutes from './textRoutes';
import rsaRoutes from './rsaRoutes';

const router: Router = Router();

router.use('/text', textRoutes);
router.use('/rsa', rsaRoutes);

export default router;