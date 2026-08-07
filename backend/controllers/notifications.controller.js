import { Notification } from '../models/notification.model';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort('-1')
      .populate('relatedUser', 'username name profilePicture headline')
      .populate('relatedPost', 'content image');
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    // const notification=await Notification.findById(id);
    // notification.read=true;
    // await notification.save();
    // res.status(200).json({success:true,notification});
    const notification = await Notification.findByIdAndUpdate(
      { _id: id, recipient: req.user._id },
      { read: true },
      { new: true },
    );
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete({
      _id: id,
      recipient: req.user._id,
    });
    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
