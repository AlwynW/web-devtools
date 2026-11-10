const Button = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled = false,
  type = "button",
}) => {
  const baseStyle =
    "flex cursor-pointer items-center justify-center gap-2 px-4 py-2 border font-mono text-xs tracking-tight rounded-button transition-colors focus:outline-none focus:ring-1 focus:ring-focus disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-primary hover:bg-primary-hover text-primary-fg border-primary-border",
    secondary:
      "bg-secondary hover:bg-secondary-hover text-secondary-fg border-secondary-border",
    outline: "border-border-muted text-fg-soft hover:bg-hover-muted",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
    >
      {Icon && <Icon size={18} weight="thin" />}
      {children}
    </button>
  );
};

export default Button;
