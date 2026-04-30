import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  conversation_id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['private', 'group'], required: true },
  name: { type: String }, // For group chats
  participants: [{ type: String }], // user_ids
  admin: { type: String }, // For group chats - user_id of admin
  avatar: { type: String },
  last_message: {
    content: String,
    sender_id: String,
    timestamp: Date
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('Conversation', conversationSchema);