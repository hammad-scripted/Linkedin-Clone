import { Router } from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';

import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getAllConnections,
  deleteConnection,
  getConnectionStatus,
} from '../controllers/connections.controller.js';
export const connectionRouter = Router();

connectionRouter.post('/request/:userId', protectRoute, sendConnectionRequest);
connectionRouter.put(
  '/accept/:requestId',
  protectRoute,
  acceptConnectionRequest,
);
connectionRouter.put(
  '/reject/:requestId',
  protectRoute,
  rejectConnectionRequest,
);
connectionRouter.get('/requests', protectRoute, getAllConnections);
connectionRouter.delete('/:userId', protectRoute, deleteConnection);
connectionRouter.get('/status/:userId', protectRoute, getConnectionStatus);
