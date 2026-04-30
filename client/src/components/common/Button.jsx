import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) => {
 const baseClasses =
  "inline-flex items-center justify-center gap-2 font-medium transition-all rounded-full";

const variantClasses = {
  primary:
    "bg-[#00a884] text-white hover:bg-[#019874]",
  
  secondary:
    "bg-[#2a3942] text-white hover:bg-[#202c33]",

  danger:
    "bg-red-500 text-white hover:bg-red-600",

  ghost:
    "bg-transparent text-[#8696a0] hover:bg-[#202c33]"
};

const sizeClasses = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base"
};

const disabledClasses = disabled
  ? "opacity-50 cursor-not-allowed"
  : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;