import { User } from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';
export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('-password');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized request, user not found!',
      });
    }

    //? get all users except the current user and which are not friends with the current user

    const excludedUsers = [currentUser._id, ...currentUser.connections];
    const suggestedUsers = await User.find({
      _id: { $nin: excludedUsers },
    })
      .select('name username profilePicture headline')
      .limit(5);

    return res.status(200).json({ success: true, suggestedUsers });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select(
      'name username profilePicture bannerImg headline location about skills experience education connections',
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'headline', 'about', 'location',
      'profilePicture', 'bannerImg', 'skills', 
      'experience', 'education', 'username'
    ];

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Handle Cloudinary uploads for images if provided
    if (req.body.profilePicture && req.body.profilePicture.startsWith('data:image')) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture, {
        folder: 'profile_pictures',
      });
      user.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg && req.body.bannerImg.startsWith('data:image')) {
      const result = await cloudinary.uploader.upload(req.body.bannerImg, {
        folder: 'banner_images',
      });
      user.bannerImg = result.secure_url;
    }

    if (req.body.username && req.body.username !== user.username) {
      const usernameTaken = await User.exists({
        username: req.body.username,
        _id: { $ne: user._id },
      });
      if (usernameTaken) {
        return res.status(409).json({
          success: false,
          message: 'Username is already in use',
        });
      }
    }

    // 2. Assign remaining allowed text/array fields to the user document
    allowedFields.forEach((field) => {
      // Skip profilePicture and bannerImg here since Cloudinary handles them above
      if (field === 'profilePicture' || field === 'bannerImg') return;

      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // 3. Save updated document
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    return res.status(200).json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
