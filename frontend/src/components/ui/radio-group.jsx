import React from "react";
import { Circle } from "lucide-react";

// Utility function for joining class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// RadioGroup wrapper
const RadioGroup = React.forwardRef(({ className = "", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid gap-2", className)}
      role="radiogroup"
      {...props}
    >
      {children}
    </div>
  );
});

RadioGroup.displayName = "RadioGroup";

// Individual radio item
const RadioGroupItem = React.forwardRef(
  ({ className = "", value, checked, onChange, disabled, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />
        <div
          className={cn(
            "flex items-center justify-center aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            className
          )}
        >
          {checked && <Circle className="h-2.5 w-2.5 fill-current text-current" />}
        </div>
      </label>
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
