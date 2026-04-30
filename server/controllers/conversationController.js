import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';
import User from '../models/user.js';

// Get all conversations for current user
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.user_id
    })
      .sort({ updated_at: -1 })
      .lean();

    // Populate participant info
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const { _id, ...rest } = conv;
        
        const participantDetails = await User.find({
          user_id: { $in: conv.participants }
        })
          .select('user_id name avatar online')
          .lean();

        const cleanParticipants = participantDetails.map(p => {
          const { _id, ...pRest } = p;
          return pRest;
        });

        return {
          ...rest,
          participant_details: cleanParticipants
        };
      })
    );

    res.json(populatedConversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ detail: 'Failed to fetch conversations' });
  }
};

// Create or get private conversation
export const createPrivateConversation = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ detail: 'User ID required' });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [req.user.user_id, user_id], $size: 2 }
    }).lean();

    if (!conversation) {
      // Create new conversation
      const newConv = new Conversation({
        conversation_id: `conv_${uuidv4().replace(/-/g, '').substring(0, 12)}`,
        type: 'private',
        participants: [req.user.user_id, user_id]
      });
      await newConv.save();
      conversation = newConv.toObject();
    }

    const { _id, ...rest } = conversation;

    // Get participant details
    const participantDetails = await User.find({
      user_id: { $in: conversation.participants }
    })
      .select('user_id name avatar online')
      .lean();

    const cleanParticipants = participantDetails.map(p => {
      const { _id: pId, ...pRest } = p;
      return pRest;
    });

    res.json({ ...rest, participant_details: cleanParticipants });
  } catch (err) {
    console.error('Create private conversation error:', err);
    res.status(500).json({ detail: 'Failed to create conversation' });
  }
};

// Create group conversation
export const createGroupConversation = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 1) {
      return res.status(400).json({ detail: 'Name and at least one participant required' });
    }

    const allParticipants = [...new Set([req.user.user_id, ...participants])];

    const conversation = new Conversation({
      conversation_id: `conv_${uuidv4().replace(/-/g, '').substring(0, 12)}`,
      type: 'group',
      name,
      participants: allParticipants,
      admin: req.user.user_id,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`
    });

    await conversation.save();
    const conv = conversation.toObject();
    const { _id, ...rest } = conv;

    // Get participant details
    const participantDetails = await User.find({
      user_id: { $in: allParticipants }
    })
      .select('user_id name avatar online')
      .lean();

    const cleanParticipants = participantDetails.map(p => {
      const { _id: pId, ...pRest } = p;
      return pRest;
    });

    res.status(201).json({ ...rest, participant_details: cleanParticipants });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ detail: 'Failed to create group' });
  }
};

// Get single conversation
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      conversation_id: req.params.conversation_id,
      participants: req.user.user_id
    }).lean();

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found' });
    }

    const { _id, ...rest } = conversation;

    const participantDetails = await User.find({
      user_id: { $in: conversation.participants }
    })
      .select('user_id name avatar online')
      .lean();

    const cleanParticipants = participantDetails.map(p => {
      const { _id: pId, ...pRest } = p;
      return pRest;
    });

    res.json({ ...rest, participant_details: cleanParticipants });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ detail: 'Failed to fetch conversation' });
  }
};
