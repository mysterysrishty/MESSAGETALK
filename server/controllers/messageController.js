import { v4 as uuidv4 } from 'uuid';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/user.js';

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      conversation_id,
      participants: req.user.user_id
    });

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found' });
    }

    const query = { conversation_id };
    if (before) {
      query.created_at = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get sender details
    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const senders = await User.find({ user_id: { $in: senderIds } })
      .select('user_id name avatar')
      .lean();

    const senderMap = {};
    senders.forEach(s => {
      senderMap[s.user_id] = { name: s.name, avatar: s.avatar };
    });

    const cleanMessages = messages.map(m => {
      const { _id, ...rest } = m;
      return {
        ...rest,
        sender: senderMap[m.sender_id] || { name: 'Unknown', avatar: '' }
      };
    }).reverse();

    res.json(cleanMessages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ detail: 'Failed to fetch messages' });
  }
};

// Send message (REST fallback, main messaging via WebSocket)
export const sendMessage = async (req, res, io) => {
  try {
    const { conversation_id } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({ detail: 'Message content required' });
    }

    // Verify user is participant
    const conversation = await Conversation.findOne({
      conversation_id,
      participants: req.user.user_id
    });

    if (!conversation) {
      return res.status(404).json({ detail: 'Conversation not found' });
    }

    const message = new Message({
      message_id: `msg_${uuidv4().replace(/-/g, '').substring(0, 12)}`,
      conversation_id,
      sender_id: req.user.user_id,
      content,
      type,
      read_by: [req.user.user_id]
    });

    await message.save();

    // Update conversation's last message
    await Conversation.updateOne(
      { conversation_id },
      {
        last_message: {
          content,
          sender_id: req.user.user_id,
          timestamp: message.created_at
        },
        updated_at: new Date()
      }
    );

    const msg = message.toObject();
    const { _id, ...rest } = msg;

    const messageResponse = {
      ...rest,
      sender: { name: req.user.name, avatar: req.user.avatar }
    };

    // Emit to all participants via Socket
    if (io) {
      io.to(conversation_id).emit('new_message', messageResponse);
    }

    res.status(201).json(messageResponse);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ detail: 'Failed to send message' });
  }
};
