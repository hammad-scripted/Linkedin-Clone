import { Post } from '../models/post.model.js';
import cloudinary from '../lib/cloudinary.js';
import { Notification } from '../models/notification.model.js';
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

    // 4. Delete the post from MongoDB
    await Post.findByIdAndDelete(postId);

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

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
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
    res.status(500).json({ message: error.message });
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
        $push: { comments: { content: comment.trim(), user: req.user._id } },
      },
      { new: true },
    )
      .populate('author', 'username name profilePicture headline')
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
      //todo send email
    }

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
