import React from "react";
import { getInitials } from "../../utils/formatters";
import { getAvatarUrl } from "../../utils/chat";

const UserAvatar = ({
  user,
  size = "md",
  showOnline = false,
  isOnline = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const onlineSizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <div className={`relative ${className}`}>
      
      {/* Avatar */}
      {user?.avatar || user?.photoURL ? (
        <img
          src={getAvatarUrl(user, user?.name || user?.email || "User")}
          alt={user.name || "User"}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full
            bg-[#202c33]
            text-white
            flex items-center justify-center
            font-medium
          `}
        >
          {getInitials(user?.name || "?")}
        </div>
      )}

      {/* Online Indicator */}
      {showOnline && (
        <div
          className={`
            absolute bottom-0 right-0
            ${onlineSizeClasses[size]}
            rounded-full
            ${isOnline ? "bg-[#00a884]" : "bg-gray-500"}
            border-2 border-[#0b141a]
          `}
        />
      )}
    </div>
  );
};

export default UserAvatar;

