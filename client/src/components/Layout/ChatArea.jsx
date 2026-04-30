import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCheck,
  MoreVertical,
  Paperclip,
  Search,
  SendHorizontal,
  Smile,
  WifiOff,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useChat } from "../../context/ChatContext";
import UserAvatar from "../common/UserAvatar";
import { getConversationName, getConversationStatus } from "../../utils/chat";
import { formatTime } from "../../utils/formatters";

// ── tiny notification sound (base64 data-uri, no file needed) ────────────────
const NOTIF_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA..."; // placeholder

const ChatArea = ({ onBack, selectedChat, currentUser }) => {
  const [message, setMessage]             = useState("");
  const [showEmoji, setShowEmoji]         = useState(false);
  const [isTyping, setIsTyping]           = useState(false);
  const [renderWake, setRenderWake]       = useState(false); // cold-start banner

  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const inputRef       = useRef(null);

  const {
    activeConversation,
    messages,
    sendMessage,
    sendTyping,
    loadingMessages,
    typingUsers,
    isConnected,
  } = useChat();

  const conversation = selectedChat || activeConversation;

  // ── scroll to bottom ─────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Render cold-start warning (show if no connection after 4 s) ──────────
  useEffect(() => {
    if (isConnected) { setRenderWake(false); return; }
    const t = setTimeout(() => setRenderWake(true), 4000);
    return () => clearTimeout(t);
  }, [isConnected]);

  // ── browser notification for incoming messages ────────────────────────────
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.sender_id === currentUser?.user_id) return; // own message

    // request permission once
    if (Notification.permission === "default") Notification.requestPermission();

    if (document.hidden && Notification.permission === "granted") {
      new Notification(`New message from ${last.sender?.name || "Someone"}`, {
        body: last.content,
        icon: last.sender?.avatar || "/chat.png",
      });
    }
  }, [messages, currentUser]);

  // ── send ──────────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text) return;

    await sendMessage(text);
    setMessage("");
    // stop typing indicator
    sendTyping(false);
    clearTimeout(typingTimer.current);
    setIsTyping(false);
  };

  // ── typing indicator ─────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 2000);
  };

  // ── emoji picker ──────────────────────────────────────────────────────────
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  // ── who is typing? ────────────────────────────────────────────────────────
  const typingList = Object.values(typingUsers);
  const typingText =
    typingList.length === 1
      ? `${typingList[0]} is typing…`
      : typingList.length > 1
      ? "Several people are typing…"
      : null;

  // ── empty state ───────────────────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="chat-pattern flex h-full flex-col items-center justify-center bg-[#0b141a] px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#202c33] shadow-lg shadow-black/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00a884]/15 text-[#00a884]">
              <SendHorizontal className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-[#e9edef]">MsgMate</h2>
          <p className="mt-2 text-sm leading-6 text-[#8696a0]">
            Pick a conversation from the left to start chatting.
          </p>
        </div>
      </div>
    );
  }

  const chatName = getConversationName(conversation, currentUser?.user_id);
  const statusText = getConversationStatus(conversation, currentUser?.user_id, typingUsers);
  const otherParticipant = conversation.participant_details?.find(
    (p) => p.user_id !== currentUser?.user_id
  );

  return (
    <div className="flex flex-col h-full">

      {/* ── Render cold-start banner ────────────────────────────────────────── */}
      {renderWake && (
        <div className="flex items-center gap-2 bg-amber-600/90 px-4 py-2 text-xs text-white">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>
            Server is waking up (free tier). This usually takes ~30 seconds — hang tight ☕
          </span>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#2a3942] bg-[#202c33] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full p-2 text-[#aebac1] transition-colors hover:bg-[#2a3942] hover:text-white md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <UserAvatar
            user={{
              name: chatName,
              avatar:
                conversation.type === "group"
                  ? conversation.avatar
                  : otherParticipant?.avatar,
            }}
            showOnline={conversation.type !== "group"}
            isOnline={statusText === "online"}
            className="shrink-0"
          />

          <div className="min-w-0">
            <h3 className="truncate font-medium text-white">{chatName}</h3>
            {/* typing text takes priority over status */}
            <span
              className={`text-xs transition-colors ${
                typingText ? "text-[#00a884]" : "text-[#8696a0]"
              }`}
            >
              {typingText || statusText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#aebac1]">
          <button className="rounded-full p-2 transition-colors hover:bg-[#2a3942] hover:text-white">
            <Search className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-[#2a3942] hover:text-white">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <div className="chat-pattern flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          {loadingMessages ? (
            /* skeleton loader instead of plain spinner */
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="h-10 animate-pulse rounded-2xl bg-[#202c33]"
                  style={{ width: `${120 + (i * 37) % 120}px` }}
                />
              </div>
            ))
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === currentUser?.user_id;
              return (
                <div
                  key={msg.message_id || msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  {/* avatar for received messages */}
                  {!isOwn && (
                    <img
                      src={
                        msg.sender?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`
                      }
                      alt=""
                      className="mr-2 mt-1 h-7 w-7 shrink-0 self-end rounded-full"
                    />
                  )}

                  <div
                    className={`
                      relative max-w-[78%] px-3.5 py-2.5 shadow-sm
                      ${isOwn
                        ? "rounded-[18px] rounded-br-[4px] bg-[#005c4b] text-white"
                        : "rounded-[18px] rounded-bl-[4px] bg-[#202c33] text-[#e9edef]"
                      }
                    `}
                  >
                    {!isOwn && conversation.type === "group" && (
                      <p className="mb-1 text-xs font-semibold text-[#53bdeb]">
                        {msg.sender?.name || "Unknown"}
                      </p>
                    )}
                    <p className="break-words text-sm leading-6">{msg.content || msg.text}</p>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-white/55">
                      <span>{formatTime(msg.created_at || msg.timestamp)}</span>
                      {isOwn && (
                        <CheckCheck className="h-3.5 w-3.5 text-[#7dd3fc]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* animated typing indicator bubble */}
          {typingText && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-[18px] rounded-bl-[4px] bg-[#202c33] px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#8696a0]"
                    style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────────── */}
      <div className="relative border-t border-[#2a3942] bg-[#202c33] px-4 py-3">
        {/* emoji picker popover */}
        {showEmoji && (
          <div className="absolute bottom-full mb-2 left-4 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              height={380}
              searchDisabled={false}
            />
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`rounded-full p-2 transition-colors ${
              showEmoji ? "text-[#00a884]" : "text-[#aebac1] hover:bg-[#2a3942] hover:text-white"
            }`}
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-[#aebac1] transition-colors hover:bg-[#2a3942] hover:text-white"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type a message"
            className="flex-1 rounded-full border border-transparent bg-[#2a3942] px-4 py-3 text-sm text-white placeholder-[#8696a0] outline-none transition focus:border-[#31444d] focus:ring-2 focus:ring-[#00a884]/40"
          />

          <button
            type="submit"
            disabled={!message.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00a884] text-[#0b141a] transition hover:bg-[#06cf9c] disabled:cursor-not-allowed disabled:bg-[#1f2c34] disabled:text-[#5f747d]"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* ── bounce keyframes (injected once) ────────────────────────────────── */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default ChatArea;