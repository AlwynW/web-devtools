export const FAVORITES_STORAGE_KEY = "devkitFavoriteToolPaths";

/**
 * @returns {string[]}
 */
export function loadFavoriteToolPaths() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    const out = [];
    for (const p of parsed) {
      if (typeof p !== "string" || p.length === 0) continue;
      const path = p === "/asset-grid" ? "/image-composition" : p;
      if (!seen.has(path)) {
        seen.add(path);
        out.push(path);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * @param {string[]} paths
 */
export function saveFavoriteToolPaths(paths) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(paths));
}

/**
 * @param {string[]} paths
 * @param {string} path
 * @returns {string[]}
 */
export function toggleFavoritePath(paths, path) {
  if (paths.includes(path)) {
    return paths.filter((p) => p !== path);
  }
  return [...paths, path];
}
