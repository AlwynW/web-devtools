import { useState, useMemo } from "react";
import { MagnifyingGlass } from "phosphor-react";
import CopyButton from "../components/CopyButton";
import { ASCII_CHARS } from "../data/asciiChars";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";

export default function AsciiUnicodeTable({ onToast }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ASCII_CHARS;
    return ASCII_CHARS.filter(
      (c) =>
        c.code.toString().includes(q) ||
        c.hex.toLowerCase().includes(q) ||
        (c.char && c.char.toLowerCase().includes(q)) ||
        c.name.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="ASCII / Unicode Table" description="Look up character codes and copy symbols." />

      <Panel className="space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="thin"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="> search by code (65), hex (0x41), or character (A)"
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
          />
        </div>

        <div className="max-h-[32rem] overflow-y-auto">
          <table className="w-full font-mono text-sm">
            <thead className="sticky top-0 bg-surface-muted border-b border-border">
              <tr>
                <th className="text-left p-2 text-[11px] text-fg-muted uppercase tracking-wider">Char</th>
                <th className="text-left p-2 text-[11px] text-fg-muted uppercase tracking-wider">Dec</th>
                <th className="text-left p-2 text-[11px] text-fg-muted uppercase tracking-wider">Hex</th>
                <th className="text-left p-2 text-[11px] text-fg-muted uppercase tracking-wider">Name</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.code}
                  className="border-b border-border hover:bg-hover group"
                >
                  <td className="p-2 font-bold text-fg-soft w-12">
                    {c.char || "—"}
                  </td>
                  <td className="p-2 text-fg-muted">{c.code}</td>
                  <td className="p-2 text-fg-muted">0x{c.hex}</td>
                  <td className="p-2 text-fg-muted text-xs">{c.name}</td>
                  <td className="p-2">
                    {c.char && c.char !== "—" && (
                      <CopyButton
                        text={c.char}
                        onCopySuccess={() => onToast("Copied!")}
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-fg-muted font-mono text-sm">
            No matching characters.
          </div>
        )}
      </Panel>
    </div>
  );
}
