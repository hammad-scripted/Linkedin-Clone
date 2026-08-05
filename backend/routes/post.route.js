import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { getFeedPosts, createPost,deletePost } from "../controllers/post.controller.js";
export const postRouter=Router();

postRouter.get('/',protectRoute,getFeedPosts);
postRouter.post('/create',protectRoute,createPost);
postRouter.delete('/delete/:id',protectRoute,deletePost)