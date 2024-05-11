import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';

const router: Router = Router();

router.post('/registration', validationMiddleware, authController.registration);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/activate/:link', authController.activateAccount);
router.get('/refresh', authController.refreshToken);

export default router;
