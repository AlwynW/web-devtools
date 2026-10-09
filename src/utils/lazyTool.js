import { lazy } from "react";

const CHUNK_RELOAD_KEY = "utilities:chunk-reload";

const listeners = new Set();
let loadingCount = 0;

function readReloadFlag() {
  try {
    return sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1";
  } catch {
    return false;
  }
}

function markReload() {
  try {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    return sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1";
  } catch {
    return false;
  }
}

function clearReloadFlag() {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

export function isStaleChunkError(error) {
  const message = String(error?.message || error || "");
  return /does not provide an export named|doesn't provide an export named|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|MIME type of ["']text\/html["']/i.test(
    message,
  );
}

function notify() {
  const isLoading = loadingCount > 0;
  for (const listener of listeners) {
    listener(isLoading);
  }
}

export function isToolModuleLoading() {
  return loadingCount > 0;
}

export function subscribeToolModuleLoading(listener) {
  listeners.add(listener);
  listener(loadingCount > 0);
  return () => listeners.delete(listener);
}

export function lazyTool(factory) {
  return lazy(() => {
    loadingCount += 1;
    queueMicrotask(notify);
    return factory()
      .then((module) => {
        clearReloadFlag();
        return module;
      })
      .catch((error) => {
        if (isStaleChunkError(error) && !readReloadFlag() && markReload()) {
          window.location.reload();
          return new Promise(() => {});
        }
        throw error;
      })
      .finally(() => {
        loadingCount = Math.max(0, loadingCount - 1);
        queueMicrotask(notify);
      });
  });
}
