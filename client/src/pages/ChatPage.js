import React, { useState } from "react";
import Sidebar from "../components/Layout/Sidebar";
import ChatArea from "../components/Layout/ChatArea";
import NewChatModal from "../components/chat/Newchatmodal";
import NewGroupModal from "../components/chat/Newgroupmodal";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const ChatPage = () => {
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [activeChat, setActiveChat] = useState(false);

  const { user } = useAuth();
  const { activeConversation } = useChat();

  return (
    <div className="h-screen overflow-hidden bg-[#0b141a] p-0 md:p-4">
      <div className="mx-auto flex h-full w-full max-w-[1600px] overflow-hidden bg-[#111b21] text-white shadow-panel md:rounded-[28px]">
        <div
          className={`
            ${activeChat ? "hidden md:flex" : "flex"}
            w-full flex-col border-r border-[#2a3942] bg-[#111b21]
            md:w-[34%] lg:w-[30%] xl:w-[27%]
          `}
        >
          <Sidebar
            onNewChat={() => setShowNewChat(true)}
            onNewGroup={() => setShowNewGroup(true)}
            onSelectChat={() => setActiveChat(true)}
            selectedChat={activeConversation}
            currentUser={user}
          />
        </div>

        <div
          className={`
            ${activeChat ? "flex" : "hidden md:flex"}
            flex-1 flex-col bg-[#0b141a]
          `}
        >
          <ChatArea
            onBack={() => setActiveChat(false)}
            selectedChat={activeConversation}
            currentUser={user}
          />
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
      />

      <NewGroupModal
        isOpen={showNewGroup}
        onClose={() => setShowNewGroup(false)}
      />
    </div>
  );
};

export default ChatPage;
