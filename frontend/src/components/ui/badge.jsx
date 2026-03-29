import React from "react";

// Simple Badge component with minimal props
export default function Badge({ children, color = "blue", className = "" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-100 text-gray-800",
    red: "bg-red-100 text-red-800",
  };

  const selectedColor = colorClasses[color] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${selectedColor} ${className}`}
    >
      {children}
    </span>
  );
}
