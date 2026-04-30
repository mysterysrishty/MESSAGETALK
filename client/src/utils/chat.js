import { formatDate, formatTime, truncateText } from "./formatters";

const buildAvatarSeed = (entity, fallback = "User") =>
  [
    entity?.user_id,
    entity?.conversation_id,
    entity?.email,
    entity?.name,
    entity?.displayName,
    fallback,
  ]
    .filter(Boolean)
    .join("-");

export const getAvatarUrl = (entity, fallback = "User") => {
  if (entity?.avatar) return entity.avatar;
  if (entity?.photoURL) return entity.photoURL;

  const seed = buildAvatarSeed(entity, fallback);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    seed
  )}`;
};

export const getConversationParticipants = (conversation, currentUserId) =>
  (conversation?.participant_details || []).filter(
    (participant) => participant.user_id !== currentUserId
  );

export const getConversationName = (conversation, currentUserId) => {
  if (!conversation) return "Select a chat";
  if (conversation.type === "group") {
    return conversation.name || "Untitled group";
  }

  const others = getConversationParticipants(conversation, currentUserId);
  return (
    others.map((participant) => participant.name).filter(Boolean).join(", ") ||
    conversation.name ||
    "New chat"
  );
};

export const getConversationAvatar = (conversation, currentUserId) => {
  if (!conversation) return getAvatarUrl(null, "Chat");
  if (conversation.type === "group" && conversation.avatar) {
    return conversation.avatar;
  }

  const others = getConversationParticipants(conversation, currentUserId);
  return getAvatarUrl(
    others[0] || conversation,
    getConversationName(conversation, currentUserId)
  );
};

export const getConversationPreview = (conversation, currentUserId) => {
  const lastMessage = conversation?.last_message?.content;
  if (lastMessage) {
    return truncateText(lastMessage, 42);
  }

  if (conversation?.type === "group") {
    const memberCount = conversation?.participant_details?.length || 0;
    return `${memberCount} members`;
  }

  const others = getConversationParticipants(conversation, currentUserId);
  return others[0]?.online ? "Online now" : "Tap to start chatting";
};

export const getConversationTimestamp = (conversation) => {
  const value = conversation?.last_message?.timestamp || conversation?.updated_at;
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? formatTime(date)
    : formatDate(date);
};

export const isConversationOnline = (conversation, currentUserId) =>
  getConversationParticipants(conversation, currentUserId).some(
    (participant) => participant.online
  );

export const getConversationStatus = (
  conversation,
  currentUserId,
  typingUsers = {}
) => {
  if (!conversation) return "Pick a chat from the sidebar";

  const others = getConversationParticipants(conversation, currentUserId);
  const typingNames = others
    .filter((participant) => typingUsers[participant.user_id])
    .map((participant) => participant.name)
    .filter(Boolean);

  if (typingNames.length > 0) {
    return conversation.type === "group"
      ? `${typingNames[0]} is typing...`
      : "typing...";
  }

  if (conversation.type === "group") {
    const memberCount = conversation?.participant_details?.length || 0;
    return `${memberCount} participants`;
  }

  return isConversationOnline(conversation, currentUserId)
    ? "online"
    : "last seen recently";
};
