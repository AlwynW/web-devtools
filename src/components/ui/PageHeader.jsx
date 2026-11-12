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
        <h2 className="title-text text-4xl mb-2 text-fg-strong">
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
