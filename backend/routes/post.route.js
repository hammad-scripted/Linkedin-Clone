import { Router } from 'express';
import { protectRoute } from '../middlewares/protectRoute.js';
import {
  getFeedPosts,
  createPost,
  deletePost,
  getPostById,
  createComment,
  likePost,
} from '../controllers/post.controller.js';
export const postRouter = Router();

postRouter.get('/', protectRoute, getFeedPosts);
postRouter.get('/:id', protectRoute, getPostById);
postRouter.post('/create', protectRoute, createPost);
postRouter.post('/:id/comment', protectRoute, createComment);
postRouter.post('/:id/like', protectRoute, likePost);
postRouter.delete('/delete/:id', protectRoute, deletePost);
