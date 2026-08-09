import { Router } from 'express';
import {signup, login, logout,getCurrentUser} from '../controllers/auth.controller.js'
import {protectRoute} from '../middlewares/protectRoute.js'
export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me',protectRoute,getCurrentUser)
