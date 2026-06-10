import { useState, useMemo } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyButton from "../components/CopyButton";

const SECTIONS = [
  {
    title: "Where to use these",
    intro:
      "Paste into the File Explorer address bar, the Win + R Run dialog, or sometimes Command Prompt / PowerShell — depending on the entry.",
    items: [],
  },
  {
    title: "Common special paths",
    intro: "These are great for jumping directly to important folders:",
    items: [
      { token: "%appdata%", description: "Roaming app data" },
      { token: "%localappdata%", description: "Local app data" },
      { token: "%programdata%", description: "Shared application data" },
      { token: "%temp%", description: "Current user temp folder" },
      { token: "%tmp%", description: "Temp folder" },
      { token: "%userprofile%", description: "Your user folder" },
      { token: "%homepath%", description: "User profile path part" },
      { token: "%homedrive%", description: "User profile drive" },
      { token: "%username%", description: "Current username" },
      { token: "%public%", description: "Public user folder" },
      { token: "%windir%", description: "Windows folder" },
      { token: "%systemroot%", description: "Usually same as Windows folder" },
      { token: "%programfiles%", description: "Program Files" },
      { token: "%programfiles(x86)%", description: "32-bit Program Files" },
      { token: "%onedrive%", description: "OneDrive folder, if configured" },
    ],
  },
  {
    title: "Useful user folders",
    parts: [
      {
        intro: "These can usually be entered directly:",
        items: [
          { token: "Documents", description: "Documents" },
          { token: "Downloads", description: "Downloads" },
          { token: "Desktop", description: "Desktop" },
          { token: "Pictures", description: "Pictures" },
          { token: "Music", description: "Music" },
          { token: "Videos", description: "Videos" },
        ],
      },
      {
        intro: "More explicit shell versions:",
        items: [
          { token: "shell:Desktop", description: "Desktop" },
          { token: "shell:Documents", description: "Documents" },
          { token: "shell:Downloads", description: "Downloads" },
          { token: "shell:Pictures", description: "Pictures" },
          { token: "shell:Music", description: "Music" },
          { token: "shell:Videos", description: "Videos" },
          { token: "shell:Profile", description: "User profile root" },
        ],
      },
    ],
  },
  {
    title: "Very useful shell: commands",
    intro:
      "These are often the best “special links” in Explorer:",
    items: [
      { token: "shell:AppData", description: "Roaming AppData" },
      { token: "shell:Local AppData", description: "Local AppData" },
      { token: "shell:Cache", description: "Internet cache-related location" },
      { token: "shell:Startup", description: "Current user startup folder" },
      { token: "shell:Common Startup", description: "All users startup folder" },
      { token: "shell:SendTo", description: "Send To menu items" },
      { token: "shell:Recent", description: "Recent files" },
      { token: "shell:Cookies", description: "Cookies" },
      { token: "shell:Fonts", description: "Fonts" },
      { token: "shell:Personal", description: "Documents" },
      { token: "shell:ProgramFiles", description: "Program Files" },
      { token: "shell:ProgramFilesX86", description: "32-bit Program Files" },
      { token: "shell:Windows", description: "Windows folder" },
      { token: "shell:System", description: "System32" },
      { token: "shell:systemx86", description: "SysWOW64" },
      { token: "shell:Common AppData", description: "Common application data" },
      { token: "shell:Common Desktop", description: "Common Desktop" },
      { token: "shell:Common Documents", description: "Common Documents" },
      { token: "shell:Common Downloads", description: "Common Downloads" },
      { token: "shell:Common Programs", description: "Common Programs" },
      { token: "shell:Common Start Menu", description: "Common Start Menu" },
      { token: "shell:Common Templates", description: "Common Templates" },
      { token: "shell:Public", description: "Public folder" },
      { token: "shell:UserProfiles", description: "User profiles" },
      { token: "shell:Profile", description: "User profile root" },
      { token: "shell:PrintersFolder", description: "Printers" },
      { token: "shell:Administrative Tools", description: "Administrative Tools" },
      { token: "shell:Common Administrative Tools", description: "Common Administrative Tools" },
      { token: "shell:ConnectionsFolder", description: "Network connections" },
      { token: "shell:NetworkPlacesFolder", description: "Network places" },
      { token: "shell:RecycleBinFolder", description: "Recycle Bin" },
    ],
  },
  {
    title: "Startup / Start Menu shortcuts",
    intro: "Very handy for managing startup apps and shortcuts:",
    items: [
      { token: "shell:Startup", description: "Your startup programs" },
      { token: "shell:Common Startup", description: "Startup for all users" },
      { token: "shell:Start Menu", description: "Your Start Menu folder" },
      { token: "shell:Common Start Menu", description: "Shared Start Menu" },
      { token: "shell:Programs", description: "Your programs menu" },
      { token: "shell:Common Programs", description: "Shared programs menu" },
    ],
  },
  {
    title: "System/admin locations",
    intro: "Useful for troubleshooting:",
    items: [
      { token: "shell:Windows", description: "Windows folder" },
      { token: "shell:System", description: "System32" },
      { token: "shell:systemx86", description: "SysWOW64" },
      { token: "C:\\Windows\\System32", description: "System32 (explicit path)" },
      { token: "%windir%\\System32", description: "System32 via %windir%" },
      { token: "%windir%\\SysWOW64", description: "SysWOW64" },
      { token: "shell:Fonts", description: "Fonts" },
      { token: "shell:Drivers", description: "May not work on all systems" },
      { token: "%programdata%", description: "ProgramData" },
      { token: "%localappdata%", description: "Local app data" },
    ],
  },
  {
    title: "Network and devices",
    parts: [
      {
        items: [
          { token: "shell:NetworkPlacesFolder", description: "Network places" },
          { token: "shell:ConnectionsFolder", description: "Network connections" },
          { token: "shell:PrintersFolder", description: "Printers" },
          { token: "shell:RecycleBinFolder", description: "Recycle Bin" },
        ],
      },
      {
        intro: "Also useful directly:",
        items: [
          { token: "\\\\localhost", description: "Localhost over SMB" },
          { token: "\\\\server-name", description: "Server (replace name)" },
          { token: "\\\\server-name\\share", description: "Share (replace server and share)" },
        ],
      },
    ],
  },
  {
    title: "Quick access via Run (Win + R)",
    intro:
      "These are not Explorer folders, but very useful Windows commands:",
    items: [
      { token: "control", description: "Control Panel" },
      { token: "appwiz.cpl", description: "Installed programs" },
      { token: "ncpa.cpl", description: "Network adapters" },
      { token: "sysdm.cpl", description: "System properties" },
      { token: "inetcpl.cpl", description: "Internet Options" },
      { token: "main.cpl", description: "Mouse settings" },
      { token: "mmsys.cpl", description: "Sound settings" },
      { token: "timedate.cpl", description: "Date/time" },
      { token: "firewall.cpl", description: "Windows Firewall" },
      { token: "desk.cpl", description: "Display settings on some systems" },
      { token: "devmgmt.msc", description: "Device Manager" },
      { token: "diskmgmt.msc", description: "Disk Management" },
      { token: "services.msc", description: "Services" },
      { token: "taskschd.msc", description: "Task Scheduler" },
      { token: "compmgmt.msc", description: "Computer Management" },
      { token: "eventvwr.msc", description: "Event Viewer" },
      { token: "regedit", description: "Registry Editor" },
      { token: "msconfig", description: "System Configuration" },
      { token: "cmd", description: "Command Prompt" },
      { token: "powershell", description: "PowerShell" },
      { token: "wt", description: "Windows Terminal" },
      { token: "explorer", description: "Open File Explorer" },
    ],
  },
  {
    title: "Explorer-specific useful paths",
    intro: "Good shortcuts in the Explorer address bar:",
    items: [
      { token: "This PC", description: "This PC" },
      { token: "Control Panel", description: "Control Panel" },
      { token: "Recycle Bin", description: "Recycle Bin" },
      { token: "shell:RecycleBinFolder", description: "Recycle Bin" },
      { token: "shell:Downloads", description: "Downloads" },
      { token: "shell:Recent", description: "Recent files" },
      { token: "shell:SendTo", description: "Send To" },
    ],
  },
  {
    title: "Best cheat sheet picks",
    intro: "If you only remember a few, make it these:",
    highlight: true,
    items: [
      { token: "%appdata%", description: "Roaming app data" },
      { token: "%localappdata%", description: "Local app data" },
      { token: "%temp%", description: "Temp" },
      { token: "%userprofile%", description: "User folder" },
      { token: "%programdata%", description: "ProgramData" },
      { token: "shell:Startup", description: "Startup folder" },
      { token: "shell:SendTo", description: "Send To" },
      { token: "shell:Recent", description: "Recent" },
      { token: "shell:Downloads", description: "Downloads" },
      { token: "shell:Profile", description: "Profile root" },
      { token: "shell:RecycleBinFolder", description: "Recycle Bin" },
      { token: "control", description: "Control Panel" },
      { token: "appwiz.cpl", description: "Installed programs" },
      { token: "services.msc", description: "Services" },
      { token: "devmgmt.msc", description: "Device Manager" },
    ],
  },
];

function itemMatches(item, q) {
  return (
    item.token.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q)
  );
}

function filterSection(section, q) {
  if (!q) return section;

  const titleMatch = section.title.toLowerCase().includes(q);
  const introMatch = section.intro?.toLowerCase().includes(q);

  if (section.parts) {
    const parts = section.parts
      .map((part) => {
        const partIntroMatch = part.intro?.toLowerCase().includes(q);
        const items = part.items.filter((i) => itemMatches(i, q));
        if (partIntroMatch || items.length) {
          return { ...part, items: partIntroMatch ? part.items : items };
        }
        return null;
      })
      .filter(Boolean);
    if (titleMatch || introMatch || parts.length) {
      return { ...section, parts: titleMatch || introMatch ? section.parts : parts };
    }
    return null;
  }

  const items = section.items?.filter((i) => itemMatches(i, q)) ?? [];
  if (titleMatch || introMatch || items.length) {
    return {
      ...section,
      items: titleMatch || introMatch ? section.items : items,
    };
  }
  return null;
}

function CheatRow({ item, onCopySuccess }) {
  return (
    <div className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group">
      <div className="min-w-0 flex-1">
        <code className="font-mono font-bold text-stone-800 dark:text-stone-200 break-all">
          {item.token}
        </code>
        <div className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          {item.description}
        </div>
      </div>
      <CopyButton
        text={item.token}
        onCopySuccess={onCopySuccess}
        size={16}
        className="ml-3 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
      />
    </div>
  );
}

export default function WindowsCheatSheet({ onToast }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((s) => filterSection(s, q)).filter(Boolean);
  }, [search]);

  const copyToast = () => onToast("Copied!");

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Windows Cheat Sheet
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Paths, shell: folders, and Run commands — grouped by usefulness.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="thin"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="> search paths and commands (e.g. appdata, services)"
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="space-y-8 max-h-[40rem] overflow-y-auto pr-1">
          {filtered.map((section) => (
            <div
              key={section.title}
              className={
                section.highlight
                  ? "p-4 border-2 border-amber-400/80 dark:border-amber-600/60 bg-amber-50/50 dark:bg-amber-950/20"
                  : ""
              }
            >
              <h3 className="text-[11px] font-mono tracking-[0.18em] text-stone-500 dark:text-stone-500 uppercase mb-2">
                {section.title}
              </h3>
              {section.intro && (
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-3 leading-relaxed">
                  {section.intro}
                </p>
              )}
              {section.parts ? (
                <div className="space-y-4">
                  {section.parts.map((part, idx) => (
                    <div key={part.intro ?? `part-${idx}`}>
                      {part.intro && (
                        <p className="text-xs font-mono text-stone-500 dark:text-stone-500 mb-2">
                          {part.intro}
                        </p>
                      )}
                      <div className="space-y-2">
                        {part.items.map((item) => (
                          <CheatRow
                            key={`${idx}-${item.token}`}
                            item={item}
                            onCopySuccess={copyToast}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                section.items?.length > 0 && (
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <CheatRow
                        key={item.token}
                        item={item}
                        onCopySuccess={copyToast}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-stone-500 font-mono text-sm">
            No matching entries.
          </div>
        )}
      </div>
    </div>
  );
}
