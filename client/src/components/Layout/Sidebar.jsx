import React, { useState } from "react";
import { MessageCirclePlus, MoreVertical, Search, Users, Wifi, WifiOff } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import UserAvatar from "../common/UserAvatar";
import ProfileModal from "../profile/ProfileModal";
import {
  getConversationName,
  getConversationPreview,
  getConversationTimestamp,
  isConversationOnline,
} from "../../utils/chat";

const Sidebar = ({ onNewChat, onNewGroup, onSelectChat, selectedChat, currentUser }) => {
  const { conversations, loadingConversations, selectConversation, isConnected } = useChat();
  const [searchTerm, setSearchTerm]         = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  const filteredChats = conversations.filter((conv) => {
    const name    = getConversationName(conv, currentUser?.user_id);
    const preview = getConversationPreview(conv, currentUser?.user_id);
    const q       = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || preview.toLowerCase().includes(q);
  });

  const handleSelect = async (conv) => {
    await selectConversation(conv);
    onSelectChat?.();
  };

  return (
    <div className="flex h-full flex-col bg-[#111b21]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#2a3942] bg-[#202c33] px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="rounded-full transition-transform hover:scale-[1.03]"
            title="Open profile settings"
          >
            <UserAvatar user={currentUser} showOnline isOnline={isConnected} className="shrink-0" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {currentUser?.name || "Your profile"}
            </p>
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="text-xs text-[#8696a0] transition-colors hover:text-white"
            >
              Edit profile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#aebac1]">
          {/* Connection status dot */}
          <span
            title={isConnected ? "Connected" : "Reconnecting…"}
            className={`hidden h-2 w-2 rounded-full md:inline-block ${
              isConnected ? "bg-[#00a884]" : "bg-amber-500 animate-pulse"
            }`}
          />
          <button
            onClick={onNewGroup}
            className="rounded-full p-2 transition-colors hover:bg-[#2a3942] hover:text-white"
            title="New Group"
          >
            <Users className="h-5 w-5" />
          </button>
          <button
            onClick={onNewChat}
            className="rounded-full p-2 transition-colors hover:bg-[#2a3942] hover:text-white"
            title="New Chat"
          >
            <MessageCirclePlus className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-[#2a3942] hover:text-white">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#1f2c34] bg-[#111b21] px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8696a0]" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-transparent bg-[#202c33] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#8696a0] outline-none transition focus:border-[#2a3942] focus:ring-2 focus:ring-[#00a884]/40"
          />
        </div>
      </div>

      {/* ── Conversation list ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          /* skeleton rows */
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-[#172229] px-4 py-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#2a3942]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#2a3942]" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-[#1f2c34]" />
              </div>
            </div>
          ))
        ) : filteredChats.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#8696a0]">
            {searchTerm ? "No chats found" : "No chats yet. Start a new chat!"}
          </div>
        ) : (
          filteredChats.map((conv) => {
            const name             = getConversationName(conv, currentUser?.user_id);
            const preview          = getConversationPreview(conv, currentUser?.user_id);
            const timestamp        = getConversationTimestamp(conv);
            const online           = isConversationOnline(conv, currentUser?.user_id);
            const isActive         = selectedChat?.conversation_id === conv.conversation_id;
            const otherParticipant = conv.participant_details?.find(
              (p) => p.user_id !== currentUser?.user_id
            );

            // unread count: messages where current user is NOT in read_by
            // (stored in conv.unread_count if you track it server-side,
            //  otherwise falls back to 0 — wire up server-side for full feature)
            const unread = conv.unread_count || 0;

            return (
              <button
                key={conv.conversation_id}
                type="button"
                onClick={() => handleSelect(conv)}
                className={`
                  group flex w-full items-center gap-3 border-b border-[#172229] px-4 py-3 text-left
                  transition-colors hover:bg-[#202c33]/90
                  ${isActive ? "border-l-2 border-l-[#00a884] bg-[#2a3942]" : ""}
                `}
              >
                <UserAvatar
                  user={{
                    name,
                    avatar:
                      conv.type === "group" ? conv.avatar : otherParticipant?.avatar,
                  }}
                  showOnline={conv.type !== "group"}
                  isOnline={online}
                  className="shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <h3
                      className={`truncate font-medium ${
                        unread > 0 ? "text-white" : "text-[#e9edef]"
                      }`}
                    >
                      {name}
                    </h3>
                    <span
                      className={`ml-2 shrink-0 text-[11px] ${
                        unread > 0 ? "text-[#00a884]" : "text-[#8696a0]"
                      }`}
                    >
                      {timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`truncate pr-2 text-sm ${
                        unread > 0 ? "font-medium text-[#e9edef]" : "text-[#8696a0]"
                      }`}
                    >
                      {preview}
                    </p>
                    {unread > 0 && (
                      <span className="ml-1 shrink-0 rounded-full bg-[#00a884] px-1.5 py-0.5 text-[10px] font-bold text-[#0b141a]">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Sidebar;