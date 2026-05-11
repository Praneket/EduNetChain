import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Check, Circle } from "lucide-react";

// ✅ Basic reusable DropdownMenu built only with React + Tailwind
export function DropdownMenu({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border border-gray-200 z-50 animate-in fade-in">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ onClick, children, icon, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-blue-50"
      } transition rounded-sm`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children }) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="border-t border-gray-200 my-1"></div>;
}
