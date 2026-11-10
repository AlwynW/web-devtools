export default function Panel({
  as: Tag = "div",
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      className={`bg-surface text-fg p-6 border border-border rounded-panel ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
