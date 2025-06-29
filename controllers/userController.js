import User from '../models/User.js';
import imagekit from '../utills/imagekit.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        ...user.toObject(),
        status: user.online ? 'online' : `last seen at ${user.lastSeen}`,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
};


export const updateAvatar = async (req, res) => {
  try {
    const { base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: 'No base64 image provided' });
    }

    const result = await imagekit.upload({
      file: base64,
      fileName: `avatar_${req.user.id}.jpg`,
      folder: 'avatars',
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.url },
      { new: true }
    ).select('-password');

    res.json({ message: 'Avatar updated', avatar: result.url, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Avatar upload failed',
      details: err.message,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { name, dob, avatar } = req.body;

    if (!name || !dob) {
      return res.status(400).json({ error: 'Name and DOB are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.username = name;
    user.dob = dob;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
};