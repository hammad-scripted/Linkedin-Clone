import { Router } from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import{getUserNotifications,markNotificationAsRead,deleteNotification} from '../controllers/notifications.controller.js'
export const notificationRouter = Router();

notificationRouter.get('/', protectRoute, getUserNotifications);
notificationRouter.put('/:id/read', protectRoute, markNotificationAsRead);
notificationRouter.delete('/:id', protectRoute, deleteNotification);
