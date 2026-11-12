import { useState, useEffect, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
import Button from "../components/Button";
import CopyArea from "../components/CopyArea";
import { WORDS } from "../utils/words";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import SegmentedControl from "../components/ui/SegmentedControl";

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
      <PageHeader title="Password" description="Generate strong, random passwords." />

      <SegmentedControl
        options={[
          { value: "words", label: "3 Random Words" },
          { value: "chars", label: "Random Characters" },
        ]}
        value={mode}
        onChange={setMode}
        className="mb-6 mx-auto"
      />

      <Panel>
        {mode === "chars" && (
          <div className="space-y-5 mb-6">
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-2 text-fg-muted">
                <span>Password Length</span>
                <span className="text-fg">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary-hover appearance-none cursor-pointer accent-fg"
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
                  className="flex items-center gap-3 p-3 border border-border rounded-control hover:bg-hover cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="w-4 h-4 text-fg border-border-muted focus:ring-focus"
                  />
                  <span className="text-sm font-mono text-fg-soft">
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
      </Panel>
    </div>
  );
}
