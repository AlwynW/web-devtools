export default function Label({ className = "", children, ...props }) {
  const margin = /\bmb-/.test(className) ? "" : "mb-2";
  return (
    <label className={`field-label ${margin} ${className}`} {...props}>
      {children}
    </label>
  );
}
