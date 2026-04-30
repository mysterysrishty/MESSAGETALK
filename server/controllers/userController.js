import User from '../models/user.js';

const IMAGE_DATA_URL_PATTERN = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const MAX_AVATAR_LENGTH = 2_800_000;

// Get all users (excluding current user)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ user_id: { $ne: req.user.user_id } })
      .select('user_id email name avatar online last_seen')
      .lean();
    
    // Remove MongoDB _id
    const cleanUsers = users.map(u => {
      const { _id, ...rest } = u;
      return rest;
    });

    res.json(cleanUsers);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ detail: 'Failed to fetch users' });
  }
};

// Update current user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (typeof name !== 'undefined') {
      const trimmedName = String(name).trim();

      if (trimmedName.length < 2 || trimmedName.length > 40) {
        return res
          .status(400)
          .json({ detail: 'Name must be between 2 and 40 characters' });
      }

      updates.name = trimmedName;
    }

    if (typeof avatar !== 'undefined') {
      if (!avatar) {
        updates.avatar = '';
      } else {
        if (typeof avatar !== 'string' || avatar.length > MAX_AVATAR_LENGTH) {
          return res
            .status(400)
            .json({ detail: 'Avatar image is too large' });
        }

        if (!IMAGE_DATA_URL_PATTERN.test(avatar)) {
          return res
            .status(400)
            .json({ detail: 'Avatar must be a valid PNG, JPG, WEBP, or GIF image' });
        }

        updates.avatar = avatar;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ detail: 'No profile changes provided' });
    }

    const user = await User.findOneAndUpdate(
      { user_id: req.user.user_id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password_hash -__v');

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const profile = user.toObject();
    delete profile._id;

    res.json(profile);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ detail: 'Failed to update profile' });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      user_id: { $ne: req.user.user_id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
      .select('user_id email name avatar online')
      .limit(10)
      .lean();

    const cleanUsers = users.map(u => {
      const { _id, ...rest } = u;
      return rest;
    });

    res.json(cleanUsers);
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ detail: 'Search failed' });
  }
};
