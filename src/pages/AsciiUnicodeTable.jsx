import { useState, useMemo } from "react";
import { MagnifyingGlass } from "phosphor-react";
import { ASCII_CHARS } from "../data/asciiChars";
import { copyToClipboard } from "../utils/clipboard";

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

  const copyChar = (char) => {
    if (char) copyToClipboard(char, () => onToast("Copied!"));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          ASCII / Unicode Table
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Look up character codes and copy symbols.
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
            placeholder="> search by code (65), hex (0x41), or character (A)"
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="max-h-[32rem] overflow-y-auto">
          <table className="w-full font-mono text-sm">
            <thead className="sticky top-0 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="text-left p-2 text-[11px] text-stone-500 uppercase tracking-wider">Char</th>
                <th className="text-left p-2 text-[11px] text-stone-500 uppercase tracking-wider">Dec</th>
                <th className="text-left p-2 text-[11px] text-stone-500 uppercase tracking-wider">Hex</th>
                <th className="text-left p-2 text-[11px] text-stone-500 uppercase tracking-wider">Name</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.code}
                  className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900"
                >
                  <td className="p-2 font-bold text-stone-800 dark:text-stone-200 w-12">
                    {c.char || "—"}
                  </td>
                  <td className="p-2 text-stone-600 dark:text-stone-400">{c.code}</td>
                  <td className="p-2 text-stone-600 dark:text-stone-400">0x{c.hex}</td>
                  <td className="p-2 text-stone-500 dark:text-stone-400 text-xs">{c.name}</td>
                  <td className="p-2">
                    {c.char && c.char !== "—" && (
                      <button
                        onClick={() => copyChar(c.char)}
                        className="px-2 py-1 border border-stone-300 dark:border-stone-700 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        Copy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-stone-500 font-mono text-sm">
            No matching characters.
          </div>
        )}
      </div>
    </div>
  );
}
