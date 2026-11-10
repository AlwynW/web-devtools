import { themeColor } from "./brand.js";

export const THEME_STORAGE_KEY = "theme";

export function resolveTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme) {
  const dark = theme === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  document.body?.classList.toggle("dark", dark);

  const color = dark ? themeColor.dark : themeColor.light;
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", color);
  });

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }

  window.dispatchEvent(
    new CustomEvent("themechange", { detail: { theme, dark } }),
  );
}

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

export function subscribeTheme(listener) {
  const onChange = (event) => listener(Boolean(event.detail?.dark));
  window.addEventListener("themechange", onChange);
  return () => window.removeEventListener("themechange", onChange);
}
