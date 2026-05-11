import React from "react";

// Utility function to join class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
