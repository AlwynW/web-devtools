import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import { WORDS } from "../utils/words";

export default function PasswordGenerator({ onToast }) {
  const [mode, setMode] = useState("words");
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [useSpecial, setUseSpecial] = useState(true);
  const [useNumber, setUseNumber] = useState(true);
  const [useCapital, setUseCapital] = useState(true);

  const generateWordPassword = useCallback(() => {
    const getWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];
    setPassword(`${getWord()}-${getWord()}-${getWord()}`);
  }, []);

  const generateCharPassword = useCallback(() => {
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specials = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let pool = lowers;
    let mandatory = "";

    if (useCapital) {
      pool += uppers;
      mandatory += uppers[Math.floor(Math.random() * uppers.length)];
    }
    if (useNumber) {
      pool += numbers;
      mandatory += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (useSpecial) {
      pool += specials;
      mandatory += specials[Math.floor(Math.random() * specials.length)];
    }

    let res = mandatory;
    while (res.length < length) {
      res += pool[Math.floor(Math.random() * pool.length)];
    }

    const final = res
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
    setPassword(final);
  }, [length, useSpecial, useNumber, useCapital]);

  useEffect(() => {
    if (mode === "words") generateWordPassword();
    else generateCharPassword();
  }, [mode, generateWordPassword, generateCharPassword]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight">Password</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Professional grade utility for daily development.
        </p>
      </header>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-max mb-6 mx-auto">
        <button
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === "words" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          onClick={() => setMode("words")}
        >
          3 Random Words
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${mode === "chars" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          onClick={() => setMode("chars")}
        >
          Random Characters
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        {mode === "chars" && (
          <div className="space-y-5 mb-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2 dark:text-slate-300">
                <span>Password Length</span>
                <span className="text-blue-600 dark:text-blue-400">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Special (!@#)",
                  state: useSpecial,
                  setter: setUseSpecial,
                },
                {
                  label: "Number (0-9)",
                  state: useNumber,
                  setter: setUseNumber,
                },
                {
                  label: "Capital (A-Z)",
                  state: useCapital,
                  setter: setUseCapital,
                },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium dark:text-slate-300">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <CopyArea
          text={password}
          onCopySuccess={() => onToast("Password copied!")}
        />

        <div className="mt-4 flex justify-end">
          <Button
            onClick={
              mode === "words" ? generateWordPassword : generateCharPassword
            }
            icon={RefreshCw}
          >
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}
