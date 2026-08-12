import { Connection } from '../models/connection.model.js';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';

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
      return res.status(403).json({ message: 'You are not authorized to accept this request' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
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

export const getAllConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'connections',
      'username name profilePicture headline',
    );
    return res.status(200).json({ success: true, connections: user.connections });
  } catch (error) {
    console.error('Error getting connections:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const connected = req.user.connections.some((id) => id.toString() === userId);
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

    return res.status(200).json({ success: true, message: 'Connection removed' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.connections.some((id) => id.toString() === userId)) {
      return res.status(200).json({ success: true, status: 'connected' });
    }

    const request = await Connection.findOne({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
      status: 'pending',
    });

    const status = !request
      ? 'not_connected'
      : request.sender.toString() === req.user._id.toString()
        ? 'pending_sent'
        : 'pending_received';
    return res.status(200).json({ success: true, status, requestId: request?._id });
  } catch (error) {
    console.error('Error getting connection status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
