import { Outlet, NavLink } from "react-router-dom";
import {
  Check,
  Settings2,
  Key,
  Hash,
  Clock,
  UserSquare2,
  Braces,
  FileCode,
  Link2,
  KeyRound,
  FileText,
  AlignLeft,
  Palette,
  Code2,
  Globe,
  Image,
  Fingerprint,
  Box,
  CalendarClock,
  BookOpen,
  Regex,
  FileType,
  FileDown,
  LayoutGrid,
  Square,
  QrCode,
} from "lucide-react";

const navGroups = [
  {
    name: "Generate",
    items: [
      { path: "/", label: "Password", icon: Key },
      { path: "/uuid", label: "UUID Gen", icon: Hash },
      { path: "/timestamp", label: "Timestamp", icon: Clock },
      { path: "/persona", label: "Persona", icon: UserSquare2 },
      { path: "/lorem", label: "Lorem", icon: AlignLeft },
      { path: "/crontab", label: "Crontab", icon: CalendarClock },
    ],
  },
  {
    name: "CSS tools",
    items: [
      { path: "/css-generator", label: "CSS Shadow/Gradient", icon: Box },
      { path: "/grid", label: "Grid", icon: LayoutGrid },      
      { path: "/perfect-border", label: "Perfect Border", icon: Square },
      
      { path: "/color", label: "Color", icon: Palette },
    ],
  },
  {
    name: "Encode / Decode",
    items: [
      { path: "/qr", label: "QR Code", icon: QrCode },
      { path: "/base64", label: "Base64", icon: FileCode },
      { path: "/base64-image", label: "Base64 Image", icon: Image },
      { path: "/url", label: "URL", icon: Link2 },
      { path: "/jwt", label: "JWT", icon: KeyRound },
      { path: "/html-entity", label: "HTML Entity", icon: Code2 },
      { path: "/hash", label: "Hash", icon: Fingerprint },
    ],
  },
  {
    name: "Convert / Validate",
    items: [
      { path: "/json", label: "JSON", icon: Braces },
      { path: "/markdown", label: "Markdown/HTML", icon: FileType },
      
    ],
  },
  {
    name: "Tools",
    items: [
      
      { path: "/regex", label: "Regex", icon: Regex },
      { path: "/markdown-viewer", label: "MD Viewer", icon: FileDown },
         
    ],
  },
  {
    name: "Reference",
    items: [
      { path: "/http-status", label: "HTTP Status", icon: FileText },
      { path: "/tailwind", label: "Tailwind", icon: BookOpen },
      { path: "/ip", label: "My IP", icon: Globe },
    ],
  }
  
];

export default function Layout({ toast }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 flex">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold border border-slate-700 dark:border-slate-200">
            <Check size={20} className="text-emerald-500" /> {toast}
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pr-56 lg:pr-64">
        <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
          <Outlet />
        </div>
      </main>

      <aside className="fixed right-0 top-0 bottom-0 w-56 lg:w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-700 z-40 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-black text-xl tracking-tighter text-blue-600 dark:text-blue-400 uppercase"
          >
            <Settings2 size={24} /> DevKit
          </NavLink>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.name}>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.name}
              </div>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-sm ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"
                      }`
                    }
                  >
                    <item.icon size={18} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #2563eb; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      `,
        }}
      />
    </div>
  );
}
