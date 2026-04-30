import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  message_id: { type: String, required: true, unique: true },
  conversation_id: { type: String, required: true },
  sender_id: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'emoji'], default: 'text' },
  read_by: [{ type: String }], // user_ids who have read
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);