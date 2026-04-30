import { v4 as uuidv4 }  from "uuid";
import { verifyToken }    from "../Utils/helpers.js";
import User               from "../models/user.js";
import Conversation       from "../models/Conversation.js";
import Message            from "../models/Message.js";

// online users: user_id → Set of socket IDs (handles multiple tabs)
const onlineUsers = new Map();

export const initializeSocket = (io) => {

  // ── Auth middleware ──────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = verifyToken(token);
      if (!decoded)  return next(new Error("Invalid token"));

      const user = await User.findOne({ user_id: decoded.sub });
      if (!user)     return next(new Error("User not found"));

      socket.user = { user_id: user.user_id, name: user.name, avatar: user.avatar };
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const { user_id, name } = socket.user;
    console.log(`✅ Connected: ${user_id}`);

    // ── Track online (multiple tabs support) ──────────────────────────────
    if (!onlineUsers.has(user_id)) onlineUsers.set(user_id, new Set());
    onlineUsers.get(user_id).add(socket.id);

    await User.updateOne({ user_id }, { online: true });
    io.emit("user_online", { user_id });

    // ── Auto-join all user's conversation rooms ───────────────────────────
    const conversations = await Conversation.find({ participants: user_id });
    conversations.forEach((conv) => socket.join(conv.conversation_id));

    // ── join / leave ──────────────────────────────────────────────────────
    socket.on("join_conversation",  (id) => socket.join(id));
    socket.on("leave_conversation", (id) => socket.leave(id));

    // ── send_message ──────────────────────────────────────────────────────
    socket.on("send_message", async (data) => {
      try {
        const { conversation_id, content, type = "text" } = data;

        if (!content?.trim()) {
          socket.emit("error", { message: "Empty message" });
          return;
        }

        const latestUser = await User.findOne({ user_id }).select("user_id name avatar");
        if (!latestUser) { socket.emit("error", { message: "User not found" }); return; }

        const conversation = await Conversation.findOne({
          conversation_id,
          participants: user_id,
        });
        if (!conversation) { socket.emit("error", { message: "Not a participant" }); return; }

        const message = await Message.create({
          message_id:      `msg_${uuidv4().replace(/-/g, "").substring(0, 12)}`,
          conversation_id,
          sender_id:       user_id,
          content:         content.trim(),
          type,
          read_by:         [user_id],
          // NEW: track delivery status
          status:          "sent",
        });

        await Conversation.updateOne(
          { conversation_id },
          {
            last_message: { content, sender_id: user_id, timestamp: message.created_at },
            updated_at:   new Date(),
          }
        );

        const payload = {
          message_id:      message.message_id,
          conversation_id,
          sender_id:       user_id,
          content,
          type,
          read_by:         message.read_by,
          status:          "sent",
          created_at:      message.created_at,
          sender:          { name: latestUser.name, avatar: latestUser.avatar },
        };

        io.to(conversation_id).emit("new_message", payload);
      } catch (err) {
        console.error("send_message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── typing indicator ──────────────────────────────────────────────────
    // We debounce on the client already; server just relays
    socket.on("typing", ({ conversation_id, is_typing }) => {
      socket.to(conversation_id).emit("user_typing", {
        user_id,
        name,
        is_typing,
      });
    });

    // ── read receipt ──────────────────────────────────────────────────────
    // Client emits this when the chat window is open and messages are visible
    socket.on("mark_read", async ({ conversation_id }) => {
      try {
        // Mark all unread messages in this convo as read by this user
        await Message.updateMany(
          { conversation_id, read_by: { $ne: user_id } },
          { $addToSet: { read_by: user_id }, $set: { status: "seen" } }
        );
        // Notify others in the room that messages were seen
        socket.to(conversation_id).emit("messages_read", { conversation_id, user_id });
      } catch (err) {
        console.error("mark_read error:", err);
      }
    });

    // ── disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`❌ Disconnected: ${user_id}`);

      const sockets = onlineUsers.get(user_id);
      if (sockets) {
        sockets.delete(socket.id);
        // Only go offline when ALL tabs/windows closed
        if (sockets.size === 0) {
          onlineUsers.delete(user_id);
          await User.updateOne({ user_id }, { online: false, last_seen: new Date() });
          io.emit("user_offline", { user_id });
        }
      }
    });
  });
};