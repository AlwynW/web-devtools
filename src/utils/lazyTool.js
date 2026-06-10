import { lazy } from "react";

const listeners = new Set();
let loadingCount = 0;

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
    return factory().finally(() => {
      loadingCount = Math.max(0, loadingCount - 1);
      queueMicrotask(notify);
    });
  });
}
