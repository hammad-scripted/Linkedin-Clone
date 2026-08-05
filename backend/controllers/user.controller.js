import { User } from '../models/user.model.js';

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
    
    const suggestedUsers = await User.find({
      _id: { $ne: currentUser._id, $nin: currentUser.connections },
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
    const user = await User.findOne({ username }).select('-password');
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
