import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-1 text-base",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-primary text-secondary shadow-theme-xs hover:bg-red-900 disabled:bg-gray-400 disabled:text-black",
    outline:
      "bg-white text-primary shadow-theme-xs border border-primary hover:bg-gray-200 disabled:text-black disabled:bg-gray-400",
  };

  return (
    <button
      className={`inline-flex items-center uppercase shadow-md justify-center gap-2 rounded transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
