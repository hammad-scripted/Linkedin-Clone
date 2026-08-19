import { Post } from '../models/post.model.js';
import cloudinary from '../lib/cloudinary.js';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import { sendCommentNotificationEmail } from '../emails/emailHandlers.js';
import { getClientUrl } from '../lib/clientUrl.js';
export const getFeedPosts = async (req, res) => {
  try {
    const feedAuthors = [...req.user.connections, req.user._id];
    const posts = await Post.find({ author: { $in: feedAuthors } })
      .populate('author', 'username name profilePicture headline')
      .populate('comments.user', 'username name profilePicture headline')
      .sort('-createdAt');
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content?.trim() && !image) {
      return res
        .status(400)
        .json({ success: false, message: 'Post content or image is required' });
    }

    let newPost;

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'posts',
      });

      newPost = await Post.create({
        author: req.user._id,
        content,
        image: result.secure_url,
      });
    } else {
      newPost = await Post.create({
        author: req.user._id,
        content,
      });
    }

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    // 1. Fetch the post
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }

    // 2. Authorization check: Ensure the post belongs to the logged-in user
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own posts',
      });
    }

    // 3. Optional: If the post contains a Cloudinary image/video, delete it
    if (post.image) {
      // Extract the Cloudinary public_id from the URL (e.g. posts/sample_id)
      const publicId = post.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete the post and notifications that point to it.
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Notification.deleteMany({ relatedPost: postId }),
    ]);

    // Optional: Remove post ID reference from User document if your schema tracks user posts
    // await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });

    return res
      .status(200)
      .json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error in deletePost controller:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

import mongoose from 'mongoose';

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Guard against missing or literal "undefined"/"null" strings
    if (!id || id === 'undefined' || id === 'null') {
      return res
        .status(400) // 400 Bad Request is more accurate than 404 here
        .json({ success: false, message: 'Invalid or missing Post ID' });
    }

    // 2. Prevent Mongoose casting errors by validating the format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Post ID format' });
    }

    // 3. Safe to query the database now
    const post = await Post.findById(id)
      .populate('author', 'username name profilePicture headline')
      .populate('comments.user', 'username name profilePicture headline');

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }

    return res.status(200).json({ success: true, post });
  } catch (error) {
    // Standardise the error response structure
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { comment } = req.body;
    if (!comment?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Comment is required' });
    }
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { comment: comment.trim(), user: req.user._id } },
      },
      { new: true },
    )
      .populate('author', 'username name profilePicture headline content')
      .populate('comments.user', 'username name profilePicture headline');

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }
    //? create notification if the comment owner is not the author of the post

    if (post.author._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author._id,
        type: 'comment',
        relatedUser: req.user._id,
        relatedPost: postId,
      });

      const postAuthor = await User.findById(post.author._id).select('email');
      if (postAuthor?.email) {
        try {
          await sendCommentNotificationEmail(
            postAuthor.email,
            post.author.name,
            req.user.name,
            `${getClientUrl()}/post/${postId}`,
            comment.trim(),
          );
        } catch (emailError) {
          console.error(
            'Comment saved, but its email notification failed:',
            emailError.message,
          );
        }
      }
    }

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.some((like) => like.equals(userId));

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.addToSet(userId);
    }

    await post.save();

    if (post.author.toString() !== userId.toString()) {
      if (isLiked) {
        await Notification.deleteOne({
          recipient: post.author,
          type: 'like',
          relatedUser: userId,
          relatedPost: post._id,
        });
      } else {
        await Notification.findOneAndUpdate(
          {
            recipient: post.author,
            type: 'like',
            relatedUser: userId,
            relatedPost: post._id,
          },
          { $set: { read: false } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    }

    return res.status(200).json({
      success: true,
      liked: !isLiked,
      post,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
