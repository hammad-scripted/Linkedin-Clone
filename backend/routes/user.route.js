import { Router } from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import { getSuggestedConnections ,getPublicProfile} from '../controllers/user.controller.js';
export const userRouter = Router();

userRouter.get('/suggestions', protectRoute, getSuggestedConnections);
userRouter.get('/:username',protectRoute,getPublicProfile)