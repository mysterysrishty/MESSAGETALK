import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const NewGroupModal = ({ isOpen, onClose }) => {
  const { users, createGroupChat, selectConversation } = useChat();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.user_id !== user?.user_id &&
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    
    const conv = await createGroupChat(groupName.trim(), selectedUsers);
    if (conv) {
      selectConversation(conv);
      onClose();
      setGroupName('');
      setSelectedUsers([]);
    }
  };

  if (!isOpen) return null;

  return (
  <div className="modal-overlay">
    <div className="modal-container">

      {/* Header */}
      <div className="modal-header">
        <h2>New Group</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Group Name */}
      <div className="group-input">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
        />
      </div>

      {/* Search */}
      <div className="modal-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users"
        />
      </div>

      {/* Selected Count */}
      {selectedUsers.length > 0 && (
        <p className="selected-count">
          {selectedUsers.length} selected
        </p>
      )}

      {/* Users */}
      <div className="modal-users">
        {filteredUsers.map((u) => {
          const isSelected = selectedUsers.includes(u.user_id);

          return (
            <div
              key={u.user_id}
              onClick={() => toggleUser(u.user_id)}
              className={`user-item ${isSelected ? "selected" : ""}`}
            >
              <img
                src={
                  u.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}`
                }
                className="avatar"
              />

              <div className="user-info">
                <span className="user-name">{u.name}</span>
                <span className="user-email">{u.email}</span>
              </div>

              {isSelected && <Check size={18} className="check-icon" />}
            </div>
          );
        })}
      </div>

      {/* Button */}
      <div className="modal-footer">
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length === 0}
        >
          Create Group
        </button>
      </div>

    </div>
  </div>
);
};

export default NewGroupModal;
