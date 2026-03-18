const Button = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  icon: Icon,
}) => {
  const baseStyle =
    "flex items-center justify-center gap-2 px-4 py-2 border font-mono text-xs tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400";
  const variants = {
    primary:
      "bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-900 dark:bg-stone-50 dark:hover:bg-stone-200 dark:text-stone-950 dark:border-stone-200",
    secondary:
      "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-stone-100 dark:border-stone-700",
    outline:
      "border-stone-400 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-900",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} weight="thin" />}
      {children}
    </button>
  );
};

export default Button;
