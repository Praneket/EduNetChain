import React from "react";

// Simple utility for combining class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const buttonVariants = {
  default:
    "bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50",
  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50",
  secondary:
    "bg-gray-600 text-white hover:bg-gray-700 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50",
  ghost:
    "bg-transparent hover:bg-gray-100 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50",
  link: "text-blue-600 hover:underline inline-flex items-center justify-center text-sm font-medium",
};

function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) {
  const baseSize =
    size === "sm"
      ? "h-9 px-3 py-1"
      : size === "lg"
      ? "h-11 px-6 py-3"
      : "h-10 px-4 py-2";

  const styles = cn(buttonVariants[variant], baseSize, className);

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}

export { Button };
