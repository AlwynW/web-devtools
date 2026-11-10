const tones = {
  danger: "bg-danger-bg border-danger-border text-danger-fg",
  warning: "bg-warning-bg border-warning-border text-warning-fg",
};

export default function ErrorBanner({
  tone = "danger",
  className = "",
  children,
  ...props
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`border rounded-control ${tones[tone] || tones.danger} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function WarningBanner(props) {
  return <ErrorBanner tone="warning" {...props} />;
}
