import { Router } from 'express';
import textRoutes from './textRoutes';

const router: Router = Router();

router.use('/text', textRoutes);

export default router;