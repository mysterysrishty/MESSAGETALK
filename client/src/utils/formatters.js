
export const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d)) return "";

  const now = new Date();
  const diff = now - d;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;

  // Today
  if (d.toDateString() === now.toDateString()) {
    return "Today";
  }

  // Yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Last 7 days
  if (days < 7) return `${days}d`;

  // Default
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};


/**
 * Format time (WhatsApp style)
 */
export const formatTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d)) return "";

  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // WhatsApp uses AM/PM
  });
};


/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};


/**
 * Truncate text safely
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";

  const str = String(text);

  if (str.length <= maxLength) return str;

  return str.slice(0, maxLength).trim() + "…";
};

