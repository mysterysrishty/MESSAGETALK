import React from "react";

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  error = "",
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full
            ${icon ? "pl-10" : "pl-4"} pr-4 py-3
            bg-[#2a3942]
            text-white
            rounded-lg
            outline-none
            placeholder-[#8696a0]
            focus:ring-2 focus:ring-[#00a884]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "ring-2 ring-red-500" : ""}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

