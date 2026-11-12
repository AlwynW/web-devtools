const sizes = {
  md: "px-5 py-2 button-text",
  sm: "px-3 py-1.5 button-text-sm",
};

const variants = {
  primary:
    "bg-primary hover:bg-primary-hover text-primary-fg border-primary-border",
  secondary:
    "bg-secondary hover:bg-secondary-hover text-secondary-fg border-secondary-border",
  outline: "border-border-muted text-fg-soft hover:bg-hover-muted",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`flex cursor-pointer items-center justify-center gap-2 border rounded-button transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    {...props}
  >
    {Icon && <Icon size={size === "sm" ? 14 : 18} weight="thin" />}
    {children}
  </button>
);

export default Button;
