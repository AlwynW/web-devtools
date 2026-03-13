export const copyToClipboard = (text, onCopy) => {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand("copy");
    onCopy?.();
  } catch (err) {
    console.error("Copy failed", err);
  }
  document.body.removeChild(el);
};
