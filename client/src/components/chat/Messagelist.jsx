
import React from "react";
import { MessageCircle, Check, CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatTime } from "../../utils/formatters";
import "./Messagelist.css";

const MessageList = ({ messages, activeConversation, messagesEndRef }) => {
  const { user } = useAuth();

  // ✅ render ticks
  const renderTicks = (status) => {
    if (status === "sent") {
      return <Check size={14} className="tick gray" />;
    }

    if (status === "delivered") {
      return <CheckCheck size={14} className="tick gray" />;
    }

    if (status === "seen") {
      return <CheckCheck size={14} className="tick blue" />;
    }

    return null;
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-14 h-14 bg-[#202c33] rounded-full flex items-center justify-center mb-3">
          <MessageCircle className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-400 text-sm">
          No messages yet. Start chatting 👋
        </p>
      </div>
    );
  }

  return (
    <div className="messages">
      {messages.map((msg) => {
        const isSent = msg.sender_id === user?.user_id;

        return (
          <div
            key={msg.message_id}
            className={`message-row ${isSent ? "sent" : "received"}`}
          >
            {/* 👤 Avatar */}
            {!isSent && (
              <img
                src={
                  msg.sender?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`
                }
                alt="dp"
                className="avatar small"
              />
            )}

            {/* 💬 Bubble */}
            <div
              className={`message-bubble ${
                isSent ? "sent-bubble" : "received-bubble"
              }`}
            >
              {/* 👥 Group name */}
              {!isSent && activeConversation?.type === "group" && (
                <span className="sender-name">
                  {msg.sender?.name}
                </span>
              )}

              {/* 📝 Message */}
              <p className="message-text">{msg.content}</p>

              {/* ⏰ Time + ✔✔ */}
              <div className="message-meta">
                <span className="message-time">
                  {formatTime(msg.created_at)}
                </span>

                {/* ✅ Only for sent messages */}
                {isSent && renderTicks(msg.status)}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

