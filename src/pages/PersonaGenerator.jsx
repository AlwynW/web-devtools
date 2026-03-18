import { useState, useEffect, useCallback } from "react";
import { ClipboardText, ArrowsClockwise } from "phosphor-react";
import { faker } from "@faker-js/faker";
import Button from "../components/Button";
import { copyToClipboard } from "../utils/clipboard";

export default function PersonaGenerator({ onToast }) {
  const [persona, setPersona] = useState(null);

  const generatePersona = useCallback(() => {
    const fName = faker.person.firstName();
    const lName = faker.person.lastName();
    const company = faker.company.name();
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
    const email = faker.internet.email({
      firstName: fName,
      lastName: lName,
      provider: `${cleanCompany}.com`,
    });

    const avatarSeed = encodeURIComponent(`${fName}${lName}${Math.random()}`);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    setPersona({
      name: `${fName} ${lName}`,
      company: company,
      email: email,
      avatar: avatarUrl,
    });
  }, []);

  useEffect(() => {
    generatePersona();
  }, [generatePersona]);

  const copyFullPersona = () => {
    if (!persona) return;
    const text = `Name: ${persona.name}\nCompany: ${persona.company}\nEmail: ${persona.email}`;
    copyToClipboard(text, () => onToast("Persona copied!"));
  };

  const copyField = (val, label) =>
    copyToClipboard(val, () => onToast(`${label} copied!`));

  if (!persona)
    return <div className="text-center p-12 font-mono text-stone-500">Loading persona generator...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Persona
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Quickly spin up fake personas for testing.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="w-40 h-40 border-4 border-stone-200 dark:border-stone-700 overflow-hidden bg-stone-50 dark:bg-stone-900">
            <img src={persona.avatar} alt="Profile" className="w-full h-full" />
          </div>
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => copyField(persona.avatar, "Avatar URL")}
          >
            Copy URL
          </Button>
        </div>

        <div className="flex-1 w-full space-y-4">
          {[
            { label: "Name", val: persona.name },
            { label: "Company", val: persona.company },
            { label: "Email", val: persona.email },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-[0.18em]">
                {field.label}
              </label>
              <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-900 p-3 border border-stone-200 dark:border-stone-700 mt-1">
                <span className="text-lg font-mono truncate pr-4 text-stone-800 dark:text-stone-100">
                  {field.val}
                </span>
                <button
                  onClick={() => copyField(field.val, field.label)}
                  className="p-2 border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <ClipboardText size={16} weight="thin" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={copyFullPersona}
          icon={ClipboardText}
        >
          Full Report
        </Button>
        <Button onClick={generatePersona} icon={ArrowsClockwise}>
          New Persona
        </Button>
      </div>
    </div>
  );
}
