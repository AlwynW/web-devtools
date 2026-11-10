export default function PageHeader({
  title,
  description,
  children,
  className = "mb-12 text-center",
  titleClassName = "",
}) {
  return (
    <header className={className}>
      <div className={titleClassName || undefined}>
        <h2 className="text-4xl font-black mb-2 tracking-tight text-fg-strong">
          {title}
        </h2>
        {description ? (
          <p className="text-[13px] font-mono text-fg-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </header>
  );
}
