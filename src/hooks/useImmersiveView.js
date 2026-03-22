import { useEffect, useState } from "react";

/**
 * Full-viewport "focus" mode: locks body scroll and closes on Escape.
 */
export function useImmersiveView() {
  const [immersive, setImmersive] = useState(false);

  useEffect(() => {
    if (!immersive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [immersive]);

  useEffect(() => {
    if (!immersive) return;
    const onKey = (e) => {
      if (e.key === "Escape") setImmersive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [immersive]);

  return [immersive, setImmersive];
}
