// components/chat/MessageInput.js
import React, { useState, useRef } from "react";

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex items-end gap-2 bg-[#202c33] p-3">
      {/* Emoji Button */}
      <button className="text-[#aebac1] hover:text-white transition-colors p-2">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </button>

      {/* Attachment Button */}
      <button className="text-[#aebac1] hover:text-white transition-colors p-2">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>

      {/* Message Input */}
      <div className="flex-1 bg-[#2a3942] rounded-lg">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          disabled={disabled}
          rows="1"
          className="w-full bg-transparent text-white placeholder-[#8696a0] px-4 py-2 outline-none resize-none max-h-[120px]"
          style={{ minHeight: "42px" }}
        />
      </div>

      {/* Send Button / Voice Recorder */}
      {message.trim() ? (
        <button
          onClick={handleSend}
          disabled={disabled}
          className="text-[#00a884] hover:text-white transition-colors p-2 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      ) : (
        <button
          onMouseDown={() => setIsRecording(true)}
          onMouseUp={() => setIsRecording(false)}
          className="text-[#aebac1] hover:text-white transition-colors p-2"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
          </svg>
        </button>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full animate-pulse">
          Recording... Release to send
        </div>
      )}
    </div>
  );
};

export default MessageInput;