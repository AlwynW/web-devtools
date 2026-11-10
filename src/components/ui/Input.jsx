const fieldClass =
  "w-full bg-surface text-fg border border-border-strong rounded-control font-mono text-sm placeholder:text-fg-subtle focus:outline-none focus:ring-1 focus:ring-focus";

export default function Input({ className = "", ...props }) {
  return <input className={`${fieldClass} px-4 py-2 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`${fieldClass} p-4 ${className}`} {...props} />;
}
