// controllers/friendController.js
import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';



export const getFriends = async (req, res) => {
  try {
    // Ensure req.user exists and has an ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized. User not found in request.' });
    }

    const userId = req.user._id.toString();

    const acceptedRequests = await FriendRequest.find({
      $or: [{ from: userId }, { to: userId }],
      status: 'accepted',
    }).populate('from to', 'username avatar code online');

    const friends = acceptedRequests.map((request) => {
      // Determine the other user in the friend request
      const fromId = request.from._id.toString();
      return fromId === userId ? request.to : request.from;
    });

    res.status(200).json({ friends });
  } catch (err) {
    res.status(500).json({ error: 'Fetching friends failed', details: err.message });
  }
};



export const sendRequest = async (req, res) => {
  try {
    const { toUserId, toUserCode } = req.body;

    // Step 1: Determine recipient user
    let toUser;
    if (toUserId) {
      if (toUserId === req.user.id) {
        return res.status(400).json({ error: 'You cannot send request to yourself' });
      }
      toUser = await User.findById(toUserId);
    } else if (toUserCode) {
      toUser = await User.findOne({ code: toUserCode });
      if (toUser && toUser._id.toString() === req.user.id) {
        return res.status(400).json({ error: 'You cannot send request to yourself' });
      }
    } else {
      return res.status(400).json({ error: 'toUserId or toUserCode is required' });
    }

    if (!toUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 2: Check if already pending
    const existing = await FriendRequest.findOne({
      from: req.user.id,
      to: toUser._id,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    // Step 3: Create request
    const request = await FriendRequest.create({
      from: req.user.id,
      to: toUser._id,
    });

    res.status(201).json({ message: 'Friend request sent', request });
  } catch (err) {
    res.status(500).json({ error: 'Sending failed', details: err.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ to: req.user.id, status: 'pending' })
      .populate('from', 'username avatar code');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
  }
};

export const respondToRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const request = await FriendRequest.findById(requestId);
    if (!request || request.to.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await request.save();

    res.json({ message: `Request ${action}ed`, request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to respond', details: err.message });
  }
};
