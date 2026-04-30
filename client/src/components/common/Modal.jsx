
import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    full: "max-w-full mx-4",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className={`
          w-full
          ${sizeClasses[size]}
          bg-[#111b21]
          rounded-lg
          overflow-hidden
          flex flex-col
          max-h-[90vh]
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] text-white">
          <h2 className="text-lg font-medium">{title}</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2a3942] transition"
          >
            <X size={20} className="text-[#8696a0]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 text-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

