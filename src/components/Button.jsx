const Button = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  icon: Icon,
}) => {
  const baseStyle =
    "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary:
      "bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100",
    outline:
      "border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;
