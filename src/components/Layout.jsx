import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  Wrench,
  Command,
  MagnifyingGlass,
  Sun,
  Moon,
  Star,
} from "phosphor-react";
import { navGroups } from "./navConfig";
import {
  FAVORITES_STORAGE_KEY,
  loadFavoriteToolPaths,
  saveFavoriteToolPaths,
  toggleFavoritePath,
} from "../utils/favoriteTools";
import { subscribeToolModuleLoading, isToolModuleLoading } from "../utils/lazyTool";
import ToolLoadingFallback from "./ToolLoadingFallback";

export default function Layout({ toast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemPrefersDark ? "dark" : "light";
  });

  const searchInputRef = useRef(null);

  const [favoritePaths, setFavoritePaths] = useState(loadFavoriteToolPaths);
  const [isToolLoading, setIsToolLoading] = useState(false);
  const [loadingToolPath, setLoadingToolPath] = useState(null);

  const beginToolNavigation = (path) => {
    setLoadingToolPath(path);
    setIsToolLoading(true);
  };

  useEffect(() => {
    return subscribeToolModuleLoading((loading) => {
      setIsToolLoading(loading);
      if (!loading) {
        setLoadingToolPath(null);
      }
    });
  }, []);

  useEffect(() => {
    setLoadingToolPath(location.pathname);
    setIsToolLoading(true);
    queueMicrotask(() => {
      if (!isToolModuleLoading()) {
        setIsToolLoading(false);
        setLoadingToolPath(null);
      }
    });
  }, [location.pathname]);

  const allItems = useMemo(() => navGroups.flatMap((g) => g.items), []);
  const validPathSet = useMemo(
    () => new Set(allItems.map((i) => i.path)),
    [allItems],
  );

  const pathToMeta = useMemo(() => {
    const map = new Map();
    for (const g of navGroups) {
      for (const item of g.items) {
        map.set(item.path, { item, groupName: g.name });
      }
    }
    return map;
  }, []);
  const activeItem =
    allItems.find((item) => item.path === location.pathname) ||
    allItems.find((item) => item.path === "/");
  const loadingItem = loadingToolPath
    ? pathToMeta.get(loadingToolPath)?.item
    : null;
  const displayItem = (isToolLoading && loadingItem) || activeItem;

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    const shouldUseDark = theme === "dark";

    if (shouldUseDark) {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Restore last used tool on first load
  useEffect(() => {
    const lastTool = localStorage.getItem("lastToolPath");
    if (lastTool && lastTool !== location.pathname) {
      beginToolNavigation(lastTool);
      navigate(lastTool);
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFavoritePaths((prev) => {
      const next = prev.filter((p) => validPathSet.has(p));
      if (next.length === prev.length) return prev;
      saveFavoriteToolPaths(next);
      return next;
    });
  }, [validPathSet]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== FAVORITES_STORAGE_KEY) return;
      setFavoritePaths(loadFavoriteToolPaths());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Focus search when tools panel opens (desktop only — skip on mobile to avoid keyboard + zoom)
  useEffect(() => {
    if (!isMenuOpen || !searchInputRef.current) return;
    if (window.matchMedia("(min-width: 640px)").matches) {
      searchInputRef.current.focus();
      searchInputRef.current.select?.();
    }
  }, [isMenuOpen]);

  const displayedGroups = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (item, groupName) => {
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        (groupName || "").toLowerCase().includes(q)
      );
    };

    if (favoritePaths.length === 0) {
      return navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            matchesSearch(item, group.name),
          ),
        }))
        .filter((group) => group.items.length > 0);
    }

    const favSet = new Set(favoritePaths);
    const favouriteItems = favoritePaths
      .map((p) => pathToMeta.get(p))
      .filter(
        (meta) =>
          meta !== undefined && matchesSearch(meta.item, meta.groupName),
      )
      .map((meta) => meta.item);

    const otherGroups = navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            matchesSearch(item, group.name) && !favSet.has(item.path),
        ),
      }))
      .filter((group) => group.items.length > 0);

    if (favouriteItems.length === 0) {
      return otherGroups;
    }

    return [{ name: "Favourites", items: favouriteItems }, ...otherGroups];
  }, [searchQuery, favoritePaths, pathToMeta]);

  const toggleFavorite = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritePaths((prev) => {
      const next = toggleFavoritePath(prev, path);
      saveFavoriteToolPaths(next);
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const outletWide =
    location.pathname === "/stopwatch" ||
    location.pathname === "/json-editor" ||
    location.pathname === "/sql-schema";

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 selection:bg-stone-200 flex flex-col">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-6 pl-3 py-3 border border-stone-700 dark:border-stone-300 flex items-center gap-3 font-mono text-xs tracking-tight">
            <Check size={18} weight="thin" className="text-white dark:text-stone-900" />{" "}
            {toast}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 flex items-center px-4 sm:px-6 h-16 border-stone-300/80 border-b dark:border-stone-700 bg-white/90 dark:bg-stone-900/95 ">
        <div className="relative flex items-center justify-between w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <NavLink
              to="/"
              className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-50 uppercase"
            >
              <Wrench size={22} weight="thin" /> DevKit
            </NavLink>
            <div className="hidden sm:flex items-center text-xs sm:text-sm font-mono text-stone-600 dark:text-stone-400 truncate">
              <span className="mx-1 text-stone-400 dark:text-stone-700">/</span>
              <span className="text-stone-900 dark:text-stone-100 flex items-center gap-1.5 min-w-0">
                {displayItem && (
                  <displayItem.icon size={14} className="text-stone-500 shrink-0" />
                )}
                <span className="truncate">
                  {displayItem?.label || "Select a tool"}
                </span>
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 flex justify-center pointer-events-none">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 border border-stone-300/80 dark:border-stone-700 bg-white/80 dark:bg-stone-900 text-xs sm:text-sm font-mono tracking-tight hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <MagnifyingGlass
                size={14}
                weight="thin"
                className="text-stone-500 dark:text-stone-300"
              />
              <span className="hidden sm:inline text-[11px] font-mono">
                &gt; search tools
              </span>
              <span className="sm:hidden text-[11px] font-mono">&gt; tools</span>
              <div className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-stone-600 dark:text-stone-400 px-2 py-[3px] border border-stone-400/60 dark:border-stone-600">
                <Command size={12} weight="thin" />
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center 
              gap-2 p-2 border border-stone-300 
              dark:border-stone-700  text-[11px] sm:text-xs font-mono 
              text-slate-700 dark:text-stone-200 
              hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <span className="relative flex items-center justify-center w-5 h-5  dark:text-stone-200  text-stone-900 overflow-hidden">
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
                    theme === "dark" ? "translate-y-0" : "translate-y-full"
                  }`}
                >
                  <Moon size={14} />
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
                    theme === "light" ? "translate-y-0" : "-translate-y-full"
                  }`}
                >
                  <Sun size={14} />
                </span>
              </span>
             
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-stone-900/40  z-30 transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-16 left-0 right-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 transition-all duration-500 ease-out flex flex-col overflow-hidden ${
          isMenuOpen
            ? "h-[calc(100dvh-4rem)] sm:h-[60vh] opacity-100 translate-y-0"
            : "h-0 opacity-0 -translate-y-4"
        }`}
      >
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800/70">
          <div className="relative max-w-2xl mx-auto">
            <MagnifyingGlass
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
              size={16}
              weight="thin"
            />
            <input
              type="text"
              placeholder="> search utilities (json, color, hash)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-base sm:text-sm font-mono text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            {displayedGroups.length === 0 ? (
              <div className="text-center py-10 text-stone-500 dark:text-stone-400 text-sm font-mono">
                No utilities found matching "{searchQuery}"
              </div>
            ) : (
              displayedGroups.map((group) => (
                <div key={group.name} className="space-y-2">
                  <h3 className="text-[11px] font-mono tracking-[0.18em] text-stone-500 dark:text-stone-500 uppercase">
                    //<span className="ml-2">{group.name}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border p-2 border-stone-200/60 dark:border-stone-900/80">
                    {group.items.map((item) => {
                      const isFav = favoritePaths.includes(item.path);
                      const subtitleSource =
                        group.name === "Favourites"
                          ? pathToMeta.get(item.path)?.groupName ?? group.name
                          : group.name;
                      return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            onClick={() => {
                              beginToolNavigation(item.path);
                              localStorage.setItem("lastToolPath", item.path);
                              setIsMenuOpen(false);
                              setSearchQuery("");
                            }}
                            className={`relative flex items-start gap-3 p-3 pr-11 text-left transition-all duration-150 group text-sm border border-stone-200 dark:border-stone-800 ${
                              location.pathname === item.path
                                ? "bg-stone-700 text-stone-100 dark:bg-stone-300 dark:text-stone-900"
                                : "bg-white text-slate-700 dark:bg-stone-900 dark:text-stone-300 hover:bg-stone-200 hover:text-stone-900"
                            }`}
                          ><button
                          type="button"
                          onClick={(e) => toggleFavorite(item.path, e)}
                          className="absolute top-2 right-2 z-10 p-1 rounded border border-transparent hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-colors"
                          aria-label={
                            isFav
                              ? "Remove from favourites"
                              : "Add to favourites"
                          }
                        >
                          <Star
                            size={16}
                            weight={isFav ? "fill" : "thin"}
                            className={
                              isFav
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-stone-400 dark:text-stone-500"
                            }
                          />
                        </button>
                            <div
                              className={`px-2 py-1 flex-shrink-0 aspect-square justify-center items-center flex transition-colors border border-stone-300 dark:border-stone-700 text-[11px] font-mono `}
                            >
                              <item.icon size={14} weight="thin" />
                            </div>
                            <div className="min-w-0">
                              {item.label}
                              <div className="text-[11px] font-mono  leading-snug line-clamp-2">
                                {item.description || subtitleSource}
                              </div>
                            </div>
                          </NavLink>
                          
                        
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <main
        className={`flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8 transition-all duration-500`}
      >
        <div
          className={
            outletWide ? "w-full max-w-none mx-auto" : "max-w-4xl mx-auto"
          }
        >
          <div className="relative min-h-[12rem]">
            {isToolLoading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-stone-100 dark:bg-stone-900">
                <ToolLoadingFallback label={loadingItem?.label ?? displayItem?.label} />
              </div>
            )}
            <Suspense fallback={null}>
              <Outlet key={location.pathname} />
            </Suspense>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(120, 113, 108, 0.5); }
      `,
        }}
      />
    </div>
  );
}
