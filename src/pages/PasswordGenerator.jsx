import { useState, useEffect, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
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
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Password
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Generate strong, random passwords.
        </p>
      </header>

      <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-max mb-6 mx-auto font-mono text-[11px]">
        <button
          className={`px-3 py-1.5 transition-colors ${
            mode === "words"
              ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
              : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
          onClick={() => setMode("words")}
        >
          3 Random Words
        </button>
        <button
          className={`px-3 py-1.5 transition-colors ${
            mode === "chars"
              ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900 border border-stone-700 dark:border-stone-400"
              : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
          onClick={() => setMode("chars")}
        >
          Random Characters
        </button>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800">
        {mode === "chars" && (
          <div className="space-y-5 mb-6">
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-2 text-stone-500 dark:text-stone-400">
                <span>Password Length</span>
                <span className="text-stone-900 dark:text-stone-100">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-stone-700 appearance-none cursor-pointer accent-stone-800 dark:accent-stone-200"
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
                  className="flex items-center gap-3 p-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="w-4 h-4 text-stone-800 border-stone-400 focus:ring-stone-500"
                  />
                  <span className="text-sm font-mono text-stone-700 dark:text-stone-300">
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
            icon={ArrowsClockwise}
          >
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}
