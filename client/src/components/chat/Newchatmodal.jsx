
import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import "./Newchatmodal.css";

const NewChatModal = ({ isOpen, onClose }) => {
  const { users, startPrivateChat, selectConversation } = useChat();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.user_id !== user?.user_id &&
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartChat = async (userId) => {
    const conv = await startPrivateChat(userId);
    if (conv) {
      selectConversation(conv);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // prevent close inside
      >

        {/* HEADER */}
        <div className="modal-header">
          <h2>New Chat</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* SEARCH */}
        <div className="modal-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* USERS */}
        <div className="modal-users">
          {filteredUsers.length === 0 ? (
            <p className="no-users">No users found</p>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.user_id}
                className="user-item"
                onClick={() => handleStartChat(u.user_id)}
              >
                <img
                  src={
                    u.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`
                  }
                  alt="dp"
                  className="avatar"
                />

                <div className="user-info">
                  <span className="user-name">{u.name}</span>
                  <span className="user-email">{u.email}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default NewChatModal;

