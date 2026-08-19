import { Connection } from '../models/connection.model.js';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import { sendConnectionAcceptedEmail } from '../emails/emailHandlers.js';

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: 'You cannot send a connection request to yourself' });
    }
    const recipient = await User.findById(userId).select('_id');
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.connections.some((id) => id.toString() === userId)) {
      return res
        .status(400)
        .json({ message: 'You are already connected with this user' });
    }
    const existingRequest = await Connection.findOne({
      $or: [
        { sender: senderId, recipient: userId },
        { sender: userId, recipient: senderId },
      ],
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({
        message: 'You have already sent a connection request to this user',
      });
    }
    const connection = await Connection.create({
      sender: senderId,
      recipient: userId,
    });

    res.status(201).json({ success: true, connection });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await Connection.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to accept this request' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    const sender = await User.findById(request.sender).select('email name');
    if (!sender) {
      return res.status(404).json({ message: 'Request sender not found' });
    }

    request.status = 'accepted';
    await Promise.all([
      request.save(),
      User.findByIdAndUpdate(request.sender, {
        $addToSet: { connections: request.recipient },
      }),
      User.findByIdAndUpdate(request.recipient, {
        $addToSet: { connections: request.sender },
      }),
      Notification.create({
        recipient: request.sender,
        type: 'connectionAccepted',
        relatedUser: userId,
      }),
    ]);

    await request.populate([
      { path: 'sender', select: 'username name profilePicture headline' },
      { path: 'recipient', select: 'username name profilePicture headline' },
    ]);

    const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, '');
    const profileUrl = `${clientUrl}/profile/${req.user.username}`;
    try {
      await sendConnectionAcceptedEmail(
        sender.email,
        sender.name,
        req.user.name,
        profileUrl,
      );
    } catch (emailError) {
      console.error(
        'Connection accepted, but its email notification failed:',
        emailError.message,
      );
    }

    return res.status(200).json({ success: true, request });
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const request = await Connection.findOne({
      _id: req.params.requestId,
      recipient: req.user._id,
      status: 'pending',
    });

    if (!request) {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    request.status = 'rejected';
    await request.save();
    return res.status(200).json({ success: true, request });
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const connectionRequests = await Connection.find({
      recipient: req.user._id,
      status: 'pending',
    })
      .populate('sender', 'username name profilePicture headline')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      connections: connectionRequests,
    });
  } catch (error) {
    console.error('Error getting connection requests:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const connected = req.user.connections.some(
      (id) => id.toString() === userId,
    );
    if (!connected) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $pull: { connections: userId } }),
      User.findByIdAndUpdate(userId, { $pull: { connections: req.user._id } }),
      Connection.deleteMany({
        $or: [
          { sender: req.user._id, recipient: userId },
          { sender: userId, recipient: req.user._id },
        ],
      }),
    ]);

    return res
      .status(200)
      .json({ success: true, message: 'Connection removed' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      'connections',
      'name username profilePicture headline connections',
    );

    res.json(user.connections);
  } catch (error) {
    console.error('Error in getUserConnections controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.connections.some((id) => id.toString() === userId)) {
      return res.status(200).json({
        success: true,
        connectionStatus: { status: 'accepted' },
      });
    }

    const request = await Connection.findOne({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
    }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(200).json({ success: true, connectionStatus: null });
    }

    return res.status(200).json({
      success: true,
      connectionStatus: {
        status: request.status,
        direction:
          request.sender.toString() === req.user._id.toString()
            ? 'sent'
            : 'received',
        requestId: request._id,
      },
    });
  } catch (error) {
    console.error('Error getting connection status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
